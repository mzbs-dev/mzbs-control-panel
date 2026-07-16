"""
add_control_plane_tables.py

Creates the tenants, platform_admins, and tenant_feature_flags tables.
signup_requests is added by a separate migration once Phase 2.5 starts,
since tenants.signup_request_id references it.

Run manually against the control-plane database:
    uv run python migrations/add_control_plane_tables.py

Follows the same "run once by hand, idempotent via IF NOT EXISTS" pattern
as mzbs's existing add_role_permissions_tables.py etc.
"""

import sys
from pathlib import Path

from sqlmodel import SQLModel

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from control_plane.db import engine
import control_plane.models  # noqa: F401  (registers models on SQLModel.metadata)
from utils.logging import logger


def upgrade() -> None:
    logger.info("Creating control-plane tables (tenants, platform_admins, "
                "tenant_feature_flags, signup_requests) if not present...")
    SQLModel.metadata.create_all(engine)
    logger.info("Control-plane tables ready.")


if __name__ == "__main__":
    upgrade()
