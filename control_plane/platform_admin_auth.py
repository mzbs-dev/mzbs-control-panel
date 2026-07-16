"""
Platform-admin authentication.

Critical property (Phase 2, Day 3 / MULTI_TENANT_PLAN.md): this uses a
DISTINCT JWT secret and a "scope" claim from mzbs's school-user tokens, so
a school ADMIN's token can never be mistaken for a platform-admin token,
and vice versa. Verified in both directions during Phase 2/5 testing.
"""

from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

import setting
from control_plane.db import get_control_plane_session
from control_plane.models import PlatformAdmin
from utils.logging import logger

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Distinct scheme so it's never confused with mzbs's /auth/login flow.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/platform-admin/login")

PLATFORM_TOKEN_SCOPE = "platform_admin"


def hash_password(plain_password: str) -> str:
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return _pwd_context.verify(plain_password, hashed_password)


def create_platform_admin_token(admin_id: int, email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=setting.PLATFORM_ADMIN_JWT_EXPIRE_MINUTES)
    payload = {
        "sub": str(admin_id),
        "email": email,
        "scope": PLATFORM_TOKEN_SCOPE,
        "exp": expire,
    }
    return jwt.encode(payload, setting.PLATFORM_ADMIN_JWT_SECRET, algorithm=setting.PLATFORM_ADMIN_JWT_ALGORITHM)


def authenticate_platform_admin(session: Session, email: str, password: str) -> Optional[PlatformAdmin]:
    admin = session.exec(select(PlatformAdmin).where(PlatformAdmin.email == email)).first()
    if not admin:
        return None
    if not verify_password(password, admin.hashed_password):
        return None
    admin.last_login_at = datetime.utcnow()
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


def get_current_platform_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[Session, Depends(get_control_plane_session)],
) -> PlatformAdmin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired platform-admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            setting.PLATFORM_ADMIN_JWT_SECRET,
            algorithms=[setting.PLATFORM_ADMIN_JWT_ALGORITHM],
        )
        if payload.get("scope") != PLATFORM_TOKEN_SCOPE:
            # A school-user token (or anything else) must never pass here,
            # even if somehow signed with the same secret by accident.
            logger.warning("Token with wrong scope attempted platform-admin access")
            raise credentials_exception
        admin_id = payload.get("sub")
        if admin_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    admin = session.get(PlatformAdmin, int(admin_id))
    if admin is None:
        raise credentials_exception
    return admin
