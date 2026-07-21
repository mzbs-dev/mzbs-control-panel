import os
import sys
from pathlib import Path

from jose import jwt

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

os.environ.setdefault("CONTROL_PLANE_DATABASE_URL", "sqlite:///test.db")
os.environ.setdefault("CONTROL_PLANE_ENCRYPTION_KEY", "test-key")
os.environ.setdefault("PLATFORM_ADMIN_JWT_SECRET", "test-secret")
os.environ.setdefault("PLATFORM_ADMIN_JWT_ALGORITHM", "HS256")

from control_plane.platform_admin_auth import create_platform_admin_token


def test_create_platform_admin_token_includes_name_claim() -> None:
    token = create_platform_admin_token(7, "admin@example.com", "Ada Lovelace")

    payload = jwt.decode(
        token,
        os.environ["PLATFORM_ADMIN_JWT_SECRET"],
        algorithms=[os.environ["PLATFORM_ADMIN_JWT_ALGORITHM"]],
    )

    assert payload["name"] == "Ada Lovelace"
