"""
seed_first_tenant.py

Phase 2, Day 5: insert the live/staging school as `tenants` row #1, with
full metadata populated (not just tenant_id + connection string), and
mark it ACTIVE (this school is already running — it's not "provisioning").

Run interactively:
    uv run python migrations/seed_first_tenant.py

Or non-interactively, e.g. in a staging setup script, by setting these
env vars before running: SEED_TENANT_ID, SEED_SCHOOL_NAME,
SEED_CONTACT_EMAIL, SEED_ADMIN_EMAIL, SEED_FRONTEND_URL,
SEED_RAW_CONNECTION_STRING, SEED_SUBSCRIPTION_PLAN
"""

import os
import sys
from pathlib import Path

from sqlmodel import Session

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from control_plane.db import engine
from control_plane.models import TenantStatus
from control_plane.tenant_service import create_tenant, update_tenant_status, get_tenant_by_id
from schemas.control_plane_schemas import TenantCreate
from utils.logging import logger


def _prompt(env_key: str, label: str, default: str = "") -> str:
    env_val = os.getenv(env_key)
    if env_val:
        return env_val
    val = input(f"{label}{f' [{default}]' if default else ''}: ").strip()
    return val or default


def main() -> None:
    print("Seeding the live/staging school as tenants row #1 (Phase 2, Day 5)\n")

    tenant_id = _prompt("SEED_TENANT_ID", "tenant_id (slug, e.g. mzbs_staging_school)")
    school_name = _prompt("SEED_SCHOOL_NAME", "School name")
    contact_email = _prompt("SEED_CONTACT_EMAIL", "Contact email")
    admin_email = _prompt("SEED_ADMIN_EMAIL", "School ADMIN's email")
    frontend_url = _prompt("SEED_FRONTEND_URL", "Frontend URL")
    raw_connection_string = _prompt(
        "SEED_RAW_CONNECTION_STRING",
        "Raw Postgres connection string for this school's own database",
    )
    subscription_plan = _prompt("SEED_SUBSCRIPTION_PLAN", "Subscription plan", default="standard")

    if not all([tenant_id, school_name, contact_email, raw_connection_string]):
        print("tenant_id, school_name, contact_email, and raw_connection_string are all required. Aborting.")
        return

    with Session(engine) as session:
        existing = get_tenant_by_id(session, tenant_id)
        if existing:
            print(f"Tenant '{tenant_id}' already exists (id={existing.id}, status={existing.status}). Aborting.")
            return

        payload = TenantCreate(
            tenant_id=tenant_id,
            school_name=school_name,
            contact_email=contact_email,
            admin_email=admin_email or None,
            frontend_url=frontend_url or None,
            raw_connection_string=raw_connection_string,
            subscription_plan=subscription_plan,
        )
        tenant = create_tenant(session, payload)

        # This school is already live — mark it active immediately rather
        # than leaving it in the default "provisioning" state new sign-ups
        # get (Decision from Phase 2.5's approval flow).
        tenant = update_tenant_status(session, tenant.tenant_id, TenantStatus.ACTIVE)

    logger.info(f"Seeded tenant '{tenant_id}' as row #1, status=active")
    print(f"\nDone. Tenant '{tenant_id}' created with id={tenant.id}, status={tenant.status}.")


if __name__ == "__main__":
    main()
