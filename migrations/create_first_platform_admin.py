"""
create_first_platform_admin.py

Creates exactly one platform-admin account, via direct DB insert.
There is deliberately no public sign-up form for platform-admin accounts
(Phase 5 guardrail) — this script is the only way one gets created.

Usage:
    uv run python migrations/create_first_platform_admin.py
"""

import getpass

from sqlmodel import Session, select

from control_plane.db import engine
from control_plane.models import PlatformAdmin
from control_plane.platform_admin_auth import hash_password
from utils.logging import logger


def main() -> None:
    email = input("Platform admin email: ").strip().lower()
    full_name = input("Full name: ").strip()
    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")

    if password != confirm:
        print("Passwords do not match. Aborting.")
        return

    with Session(engine) as session:
        existing = session.exec(select(PlatformAdmin).where(PlatformAdmin.email == email)).first()
        if existing:
            print(f"A platform admin with email '{email}' already exists. Aborting.")
            return

        admin = PlatformAdmin(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)

    logger.info(f"Created platform admin: {email}")
    print(f"Done. Platform admin '{email}' created with id={admin.id}.")


if __name__ == "__main__":
    main()
