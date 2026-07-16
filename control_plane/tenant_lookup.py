"""
Cached tenant -> connection-string lookup.

This is the CANONICAL copy (Decision #16). A read-only mirrored copy of
this exact logic lives in mzbs's control_plane_client/tenant_lookup.py —
Phase 3's get_session() calls that mirrored copy, not this one directly,
since mzbs and mzbs-control-panel are separate deployments.

Both copies point at the same Postgres database via CONTROL_PLANE_DATABASE_URL.
Fails closed: unknown tenant -> 404, not a default. Non-active/non-trial
status -> 403, checked on every call (subject to this cache's TTL).
"""

import threading
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlmodel import Session

from control_plane.crypto import decrypt_connection_string
from control_plane.models import Tenant
from utils.logging import logger

_tenant_cache: dict[str, tuple[str, str, datetime]] = {}  # tenant_id -> (conn_str, status, cached_at)
_cache_lock = threading.Lock()
_CACHE_TTL = timedelta(minutes=5)


def _fetch_tenant(session: Session, tenant_id: str) -> Tenant | None:
    from sqlmodel import select
    return session.exec(select(Tenant).where(Tenant.tenant_id == tenant_id)).first()


def lookup_tenant_connection(tenant_id: str, session: Session) -> str:
    """Resolve a tenant_id to a decrypted connection string.

    `session` is a control-plane DB session (Depends(get_control_plane_session)
    in this repo; the mirrored mzbs copy has its own equivalent dependency).
    """
    with _cache_lock:
        cached = _tenant_cache.get(tenant_id)
        if cached:
            conn_str, status, cached_at = cached
            if datetime.utcnow() - cached_at < _CACHE_TTL:
                _check_status(tenant_id, status)
                return conn_str
            # expired — fall through to refetch
            _tenant_cache.pop(tenant_id, None)

    tenant = _fetch_tenant(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Unknown school")

    conn_str = decrypt_connection_string(tenant.db_connection_secret)
    status = tenant.status.value if hasattr(tenant.status, "value") else tenant.status

    with _cache_lock:
        _tenant_cache[tenant_id] = (conn_str, status, datetime.utcnow())

    _check_status(tenant_id, status)
    return conn_str


def _check_status(tenant_id: str, status: str) -> None:
    if status not in ("active", "trial"):
        logger.warning(f"Blocked connection attempt for tenant '{tenant_id}' with status '{status}'")
        raise HTTPException(status_code=403, detail="School account is not active")


def invalidate_tenant_cache(tenant_id: str) -> None:
    """Call this immediately after any status/connection-string change.
    Only clears THIS process's cache — the mirrored copy in mzbs has its
    own separate cache and picks up changes on its own TTL (Decision #16)."""
    with _cache_lock:
        _tenant_cache.pop(tenant_id, None)
