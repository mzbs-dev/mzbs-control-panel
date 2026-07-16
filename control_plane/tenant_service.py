"""
Tenant CRUD + subscription + feature-flag management.

This module owns all WRITES to the tenants table (Decision #16 — mzbs's
mirrored tenant_lookup.py is read-only and must never import from here).
"""

from datetime import datetime, date
from typing import Optional

from fastapi import HTTPException
from sqlmodel import Session, select

from control_plane.crypto import encrypt_connection_string
from control_plane.models import Tenant, TenantStatus, TenantFeatureFlag
from control_plane.tenant_lookup import invalidate_tenant_cache
from schemas.control_plane_schemas import TenantCreate, TenantSubscriptionUpdate
from utils.logging import logger


def get_tenant_by_id(session: Session, tenant_id: str) -> Optional[Tenant]:
    return session.exec(select(Tenant).where(Tenant.tenant_id == tenant_id)).first()


def list_tenants(session: Session) -> list[Tenant]:
    return list(session.exec(select(Tenant)).all())


def create_tenant(session: Session, payload: TenantCreate) -> Tenant:
    existing = get_tenant_by_id(session, payload.tenant_id)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"tenant_id '{payload.tenant_id}' already exists",
        )

    encrypted_secret = encrypt_connection_string(payload.raw_connection_string)

    tenant = Tenant(
        tenant_id=payload.tenant_id,
        school_name=payload.school_name,
        address=payload.address,
        city=payload.city,
        country=payload.country,
        logo_url=payload.logo_url,
        contact_email=payload.contact_email,
        contact_phone=payload.contact_phone,
        admin_name=payload.admin_name,
        admin_email=payload.admin_email,
        frontend_url=payload.frontend_url,
        backend_url=payload.backend_url,
        db_connection_secret=encrypted_secret,
        status=TenantStatus.PROVISIONING,
        subscription_plan=payload.subscription_plan,
        subscription_expiry=payload.subscription_expiry,
        signup_request_id=payload.signup_request_id,
    )
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    logger.info(f"Created tenant '{tenant.tenant_id}' (status=provisioning)")
    return tenant


def update_tenant_status(session: Session, tenant_id: str, new_status: TenantStatus) -> Tenant:
    tenant = get_tenant_by_id(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Unknown tenant")

    old_status = tenant.status
    tenant.status = new_status
    tenant.updated_at = datetime.utcnow()
    session.add(tenant)
    session.commit()
    session.refresh(tenant)

    # Critical: clear this service's own in-memory cache immediately.
    # mzbs's separate mirrored cache clears on its own TTL (Phase 3).
    invalidate_tenant_cache(tenant_id)

    logger.info(f"Tenant '{tenant_id}' status: {old_status} -> {new_status}")
    return tenant


def update_tenant_subscription(
    session: Session, tenant_id: str, payload: TenantSubscriptionUpdate
) -> Tenant:
    tenant = get_tenant_by_id(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Unknown tenant")

    if payload.subscription_plan is not None:
        tenant.subscription_plan = payload.subscription_plan
    if payload.subscription_expiry is not None:
        tenant.subscription_expiry = payload.subscription_expiry
    tenant.updated_at = datetime.utcnow()

    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    logger.info(f"Tenant '{tenant_id}' subscription updated")
    return tenant


def touch_last_activity(session: Session, tenant_id: str) -> None:
    """Called at login (Phase 3) to update last_activity_at. Best-effort —
    failures here should never block a login."""
    tenant = get_tenant_by_id(session, tenant_id)
    if tenant:
        tenant.last_activity_at = datetime.utcnow()
        session.add(tenant)
        session.commit()


# ---------- Feature flags ----------

def get_feature_flags(session: Session, tenant_id: str) -> list[TenantFeatureFlag]:
    tenant = get_tenant_by_id(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Unknown tenant")
    return list(
        session.exec(
            select(TenantFeatureFlag).where(TenantFeatureFlag.tenant_id == tenant.id)
        ).all()
    )


def set_feature_flag(session: Session, tenant_id: str, module: str, enabled: bool) -> TenantFeatureFlag:
    tenant = get_tenant_by_id(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Unknown tenant")

    flag = session.exec(
        select(TenantFeatureFlag).where(
            TenantFeatureFlag.tenant_id == tenant.id,
            TenantFeatureFlag.module == module,
        )
    ).first()

    if flag:
        flag.enabled = enabled
    else:
        flag = TenantFeatureFlag(tenant_id=tenant.id, module=module, enabled=enabled)

    session.add(flag)
    session.commit()
    session.refresh(flag)
    logger.info(f"Tenant '{tenant_id}' feature flag '{module}' -> {enabled}")
    return flag
