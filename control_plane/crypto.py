"""
Encrypt/decrypt tenant database connection strings.

Per MULTI_TENANT_PLAN.md Decision #17: connection strings are stored
Fernet-encrypted directly in the `tenants` row (not a secrets-manager
reference). Both mzbs-control-panel (this file, canonical) and mzbs's
mirrored read-only copy use the SAME CONTROL_PLANE_ENCRYPTION_KEY.

Never commit the key, log it, or persist it anywhere except an env var.
"""

from cryptography.fernet import Fernet, InvalidToken

import setting
from utils.logging import logger

_fernet = Fernet(setting.CONTROL_PLANE_ENCRYPTION_KEY.encode())


def encrypt_connection_string(raw: str) -> str:
    """Encrypt a plaintext Postgres connection string for storage."""
    if not raw:
        raise ValueError("Cannot encrypt an empty connection string")
    return _fernet.encrypt(raw.encode()).decode()


def decrypt_connection_string(encrypted: str) -> str:
    """Decrypt a stored connection string back to plaintext, for use only
    at the point of creating a DB engine. Never log the return value."""
    try:
        return _fernet.decrypt(encrypted.encode()).decode()
    except InvalidToken:
        # Deliberately don't log the encrypted value itself here.
        logger.error("Failed to decrypt a tenant connection secret — check CONTROL_PLANE_ENCRYPTION_KEY")
        raise
