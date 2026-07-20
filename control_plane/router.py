"""
Platform-admin API router, plus the public sign-up endpoint (Phase 2.5).

public_signup_router has NO auth and IS rate-limited — treated with the
same care as a login endpoint. platform_router requires a platform-admin
token for everything, including signup review/approval.

/platform-admin/login is also rate-limited (per-IP), same reasoning as
/signup: it's the one endpoint in platform_router reachable without a
token, so it's a brute-force target like any other login form.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Request
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
from control_plane import tenant_service, signup_service
from control_plane.models import SignupStatus
from control_plane.rate_limit import limiter
from schemas.control_plane_schemas import (
    PlatformAdminLogin,
    PlatformAdminToken,
    TenantCreate,
    TenantResponse,
    TenantStatusUpdate,
    TenantSubscriptionUpdate,
    TenantUpdate,
    FeatureFlagUpdate,
    FeatureFlagResponse,
    SignupCreate,
    SignupResponse,
    SignupReject,
    SignupApprove,
)
from fastapi import HTTPException

platform_router = APIRouter(prefix="/platform-admin", tags=["Platform Admin"])

CurrentAdmin = Annotated[PlatformAdmin, Depends(get_current_platform_admin)]
CPSession = Annotated[Session, Depends(get_control_plane_session)]

@platform_router.post("/login", response_model=PlatformAdminToken)
@limiter.limit("10/minute")
def login(request: Request, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: CPSession):
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

@platform_router.patch("/tenants/{tenant_id}", response_model=TenantResponse)
def update_tenant_info(
    tenant_id: str, payload: TenantUpdate, admin: CurrentAdmin, session: CPSession
):
    return tenant_service.update_tenant(session, tenant_id, payload)

@platform_router.delete("/tenants/{tenant_id}", status_code=204)
def delete_tenant(tenant_id: str, admin: CurrentAdmin, session: CPSession):
    tenant_service.delete_tenant(session, tenant_id)

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

# ---------- Phase 2.5: signup review (authenticated) ----------

@platform_router.get("/signups", response_model=list[SignupResponse])
def list_signups(admin: CurrentAdmin, session: CPSession, status: SignupStatus | None = None):
    return signup_service.list_signup_requests(session, status)

@platform_router.post("/signups/{signup_id}/approve", response_model=TenantResponse, status_code=201)
def approve_signup(
    signup_id: int, payload: SignupApprove, admin: CurrentAdmin, session: CPSession
):
    return signup_service.approve_signup_request(
        session, signup_id, admin.id, payload.tenant_id, payload.raw_connection_string
    )

@platform_router.post("/signups/{signup_id}/reject", response_model=SignupResponse)
def reject_signup(signup_id: int, payload: SignupReject, admin: CurrentAdmin, session: CPSession):
    return signup_service.reject_signup_request(session, signup_id, admin.id, payload.rejection_reason)

# ---------- Phase 2.5: public sign-up (no auth, rate-limited) ----------

public_signup_router = APIRouter(tags=["Public Signup"])

@public_signup_router.post("/signup", response_model=SignupResponse, status_code=201)
@limiter.limit("5/hour")
def submit_signup(request: Request, payload: SignupCreate, session: CPSession):
    return signup_service.create_signup_request(session, payload)
