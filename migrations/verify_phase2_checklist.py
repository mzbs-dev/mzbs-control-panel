"""
verify_phase2_checklist.py

Runs the Phase 2 review checklist from MULTI_TENANT_PLAN.md against
whatever CONTROL_PLANE_DATABASE_URL is currently configured (point this
at mzbs-staging-control-plane, not production). Creates one throwaway
tenant, exercises every checklist item, then deletes it.

Usage:
    uv run python migrations/verify_phase2_checklist.py
"""

import sys
import uuid
from pathlib import Path

from sqlmodel import Session, select

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from control_plane.db import engine
from control_plane.models import Tenant, TenantStatus, TenantFeatureFlag
from control_plane.tenant_service import (
    create_tenant,
    get_tenant_by_id,
    update_tenant_status,
    set_feature_flag,
    get_feature_flags,
)
from control_plane.tenant_lookup import lookup_tenant_connection, invalidate_tenant_cache
from schemas.control_plane_schemas import TenantCreate

TEST_TENANT_ID = f"phase2_check_{uuid.uuid4().hex[:8]}"
RAW_CONN = "postgresql://fake_user:fake_pass@fake_host/fake_db"

results: list[tuple[str, bool, str]] = []


def check(label: str, condition: bool, detail: str = "") -> None:
    results.append((label, condition, detail))
    print(f"  [{'PASS' if condition else 'FAIL'}] {label}{f' — {detail}' if detail and not condition else ''}")


def main() -> None:
    print(f"Phase 2 review checklist (throwaway tenant: {TEST_TENANT_ID})\n")

    with Session(engine) as session:
        # 1. Create + real tenant_id -> correct connection string
        tenant = create_tenant(
            session,
            TenantCreate(
                tenant_id=TEST_TENANT_ID,
                school_name="Phase 2 Checklist School",
                contact_email="checklist@example.com",
                raw_connection_string=RAW_CONN,
            ),
        )
        check("Tenant created with status=provisioning", tenant.status == TenantStatus.PROVISIONING)

        # provisioning isn't active/trial yet — lookup should 403
        try:
            lookup_tenant_connection(TEST_TENANT_ID, session)
            check("Provisioning status blocks lookup (403 expected)", False, "did not raise")
        except Exception as e:
            check("Provisioning status blocks lookup (403 expected)", getattr(e, "status_code", None) == 403)

        # 2. Activate -> lookup succeeds with correct decrypted string
        update_tenant_status(session, TEST_TENANT_ID, TenantStatus.ACTIVE)
        invalidate_tenant_cache(TEST_TENANT_ID)
        conn_str = lookup_tenant_connection(TEST_TENANT_ID, session)
        check("Active tenant_id -> correct connection string", conn_str == RAW_CONN)

        # 3. Nonexistent tenant_id -> 404, no crash
        try:
            lookup_tenant_connection("definitely_does_not_exist_" + uuid.uuid4().hex, session)
            check("Nonexistent tenant_id -> 404", False, "did not raise")
        except Exception as e:
            check("Nonexistent tenant_id -> 404", getattr(e, "status_code", None) == 404)

        # 4. Suspend -> immediate 403, no restart needed
        update_tenant_status(session, TEST_TENANT_ID, TenantStatus.SUSPENDED)
        try:
            lookup_tenant_connection(TEST_TENANT_ID, session)
            check("Suspend takes effect immediately (403 expected)", False, "did not raise")
        except Exception as e:
            check("Suspend takes effect immediately (403 expected)", getattr(e, "status_code", None) == 403)

        # 5. Reactivate -> works again
        update_tenant_status(session, TEST_TENANT_ID, TenantStatus.ACTIVE)
        conn_str_again = lookup_tenant_connection(TEST_TENANT_ID, session)
        check("Reactivate -> works again", conn_str_again == RAW_CONN)

        # 6. Trial status behaves like active (passes)
        update_tenant_status(session, TEST_TENANT_ID, TenantStatus.TRIAL)
        try:
            lookup_tenant_connection(TEST_TENANT_ID, session)
            check("Trial status passes", True)
        except Exception:
            check("Trial status passes", False)

        # 7. Expired status blocks
        update_tenant_status(session, TEST_TENANT_ID, TenantStatus.EXPIRED)
        try:
            lookup_tenant_connection(TEST_TENANT_ID, session)
            check("Expired status blocks (403 expected)", False, "did not raise")
        except Exception as e:
            check("Expired status blocks (403 expected)", getattr(e, "status_code", None) == 403)

        # 8. Feature-flag CRUD
        set_feature_flag(session, TEST_TENANT_ID, "exam", True)
        flags = get_feature_flags(session, TEST_TENANT_ID)
        check("Feature-flag CRUD works", any(f.module == "exam" and f.enabled for f in flags))

        # 9. db_connection_secret confirmed encrypted (not plaintext) via direct inspection
        tenant_row = get_tenant_by_id(session, TEST_TENANT_ID)
        check(
            "db_connection_secret stored encrypted, not plaintext",
            tenant_row.db_connection_secret != RAW_CONN,
        )

        # --- cleanup ---
        # Two separate commits, deliberately: there's no ORM relationship()
        # between Tenant and TenantFeatureFlag (just a raw FK column), so
        # SQLAlchemy can't infer delete order on its own. Flags must be
        # committed gone before the tenant row is deleted, or Postgres
        # rejects it with a ForeignKeyViolation.
        for flag in session.exec(
            select(TenantFeatureFlag).where(TenantFeatureFlag.tenant_id == tenant_row.id)
        ).all():
            session.delete(flag)
        session.commit()

        session.delete(tenant_row)
        session.commit()
        invalidate_tenant_cache(TEST_TENANT_ID)

    print()
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"{passed}/{len(results)} checklist items passed. Throwaway tenant cleaned up.")


if __name__ == "__main__":
    main()
