"""
Platform-admin API router.

Phase 2.5's public POST /signup endpoint is added separately once that
phase starts (needs its own rate-limiting setup) — kept out of this file
for now so this router stays focused on authenticated platform-admin
operations only.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from control_plane.db import get_control_plane_session
from control_plane.models import PlatformAdmin
from control_plane.platform_admin_auth import (
    authenticate_platform_admin,
    create_platform_admin_token,
    get_current_platform_admin,
)
from control_plane.tenant_lookup import lookup_tenant_connection  # noqa: F401 (available for internal use)
from control_plane import tenant_service
from schemas.control_plane_schemas import (
    PlatformAdminLogin,
    PlatformAdminToken,
    TenantCreate,
    TenantResponse,
    TenantStatusUpdate,
    TenantSubscriptionUpdate,
    FeatureFlagUpdate,
    FeatureFlagResponse,
)
from fastapi import HTTPException

platform_router = APIRouter(prefix="/platform-admin", tags=["Platform Admin"])

CurrentAdmin = Annotated[PlatformAdmin, Depends(get_current_platform_admin)]
CPSession = Annotated[Session, Depends(get_control_plane_session)]


@platform_router.post("/login", response_model=PlatformAdminToken)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: CPSession):
    admin = authenticate_platform_admin(session, form_data.username, form_data.password)
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_platform_admin_token(admin.id, admin.email)
    return PlatformAdminToken(access_token=token)


@platform_router.get("/tenants", response_model=list[TenantResponse])
def list_all_tenants(admin: CurrentAdmin, session: CPSession):
    return tenant_service.list_tenants(session)


@platform_router.get("/tenants/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: str, admin: CurrentAdmin, session: CPSession):
    tenant = tenant_service.get_tenant_by_id(session, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Unknown tenant")
    return tenant


@platform_router.post("/tenants", response_model=TenantResponse, status_code=201)
def create_new_tenant(payload: TenantCreate, admin: CurrentAdmin, session: CPSession):
    return tenant_service.create_tenant(session, payload)


@platform_router.patch("/tenants/{tenant_id}/status", response_model=TenantResponse)
def set_tenant_status(
    tenant_id: str, payload: TenantStatusUpdate, admin: CurrentAdmin, session: CPSession
):
    return tenant_service.update_tenant_status(session, tenant_id, payload.status)


@platform_router.patch("/tenants/{tenant_id}/subscription", response_model=TenantResponse)
def set_tenant_subscription(
    tenant_id: str, payload: TenantSubscriptionUpdate, admin: CurrentAdmin, session: CPSession
):
    return tenant_service.update_tenant_subscription(session, tenant_id, payload)


@platform_router.get("/tenants/{tenant_id}/feature-flags", response_model=list[FeatureFlagResponse])
def list_feature_flags(tenant_id: str, admin: CurrentAdmin, session: CPSession):
    flags = tenant_service.get_feature_flags(session, tenant_id)
    return [FeatureFlagResponse(module=f.module, enabled=f.enabled) for f in flags]


@platform_router.patch("/tenants/{tenant_id}/feature-flags/{module}", response_model=FeatureFlagResponse)
def update_feature_flag(
    tenant_id: str, module: str, payload: FeatureFlagUpdate, admin: CurrentAdmin, session: CPSession
):
    flag = tenant_service.set_feature_flag(session, tenant_id, module, payload.enabled)
    return FeatureFlagResponse(module=flag.module, enabled=flag.enabled)
