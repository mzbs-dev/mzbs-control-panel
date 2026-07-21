"""
Settings for the mzbs-control-panel service.

Per MULTI_TENANT_PLAN.md Decision #18, this service is allowed to hold
per-tenant secrets (it OWNS the control-plane database, read+write).
The shared mzbs backend only ever gets a READ-ONLY mirrored copy of the
lookup logic and must never hold write credentials to this database.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env", override=False)
# --- Control-plane database (this service owns it: read + write) ---
CONTROL_PLANE_DATABASE_URL: str = os.getenv("CONTROL_PLANE_DATABASE_URL", "")

# --- Fernet key used to encrypt/decrypt tenants.db_connection_secret ---
# Generate once with:
#   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Never commit this value. Same key must be present in mzbs's env too,
# since mzbs decrypts with it (read-only) per Decision #16.
CONTROL_PLANE_ENCRYPTION_KEY: str = os.getenv("CONTROL_PLANE_ENCRYPTION_KEY", "")

# --- JWT signing for platform-admin tokens ---
# Deliberately a DIFFERENT secret/scope than mzbs's school-user JWT secret,
# per Decision (Phase 2, Day 3): a school ADMIN's token must never be
# mistaken for a platform-admin token, and vice versa.
PLATFORM_ADMIN_JWT_SECRET: str = os.getenv("PLATFORM_ADMIN_JWT_SECRET", "")
PLATFORM_ADMIN_JWT_ALGORITHM: str = os.getenv("PLATFORM_ADMIN_JWT_ALGORITHM", "HS256")
PLATFORM_ADMIN_JWT_EXPIRE_MINUTES: int = int(
    os.getenv("PLATFORM_ADMIN_JWT_EXPIRE_MINUTES", "60")
)

# --- CORS: the mzbs-platform frontend (marketing + admin dashboard) ---
FRONTEND_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# --- Trusted hosts for browser/API requests ---
TRUSTED_HOSTS: list[str] = [
    host.strip()
    for host in os.getenv(
        "TRUSTED_HOSTS",
        "localhost,127.0.0.1,[::1],bismillah-karo.netlify.app,mzbs-control-panel.fastapicloud.dev",
    ).split(",")
    if host.strip()
]

# --- Basic startup validation ---
_required = {
    "CONTROL_PLANE_DATABASE_URL": CONTROL_PLANE_DATABASE_URL,
    "CONTROL_PLANE_ENCRYPTION_KEY": CONTROL_PLANE_ENCRYPTION_KEY,
    "PLATFORM_ADMIN_JWT_SECRET": PLATFORM_ADMIN_JWT_SECRET,
}
_missing = [name for name, value in _required.items() if not value]
if _missing:
    raise ValueError(
        f"Missing required environment variable(s): {', '.join(_missing)}. "
        "See .env.example for what's needed."
    )
