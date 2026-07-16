"""
Request/response schemas for the control-panel API.

Critical rule (Phase 5, Day 2): TenantResponse deliberately excludes
db_connection_secret entirely. There is no legitimate reason for it to
ever leave this backend after creation.
"""

from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from control_plane.models import TenantStatus, SignupStatus


# ---------- Tenant ----------

class TenantCreate(BaseModel):
    tenant_id: str
    school_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    admin_name: Optional[str] = None
    admin_email: Optional[EmailStr] = None
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None
    raw_connection_string: str  # plaintext, in-memory only — encrypted before storage, never stored/logged as-is
    subscription_plan: Optional[str] = None
    subscription_expiry: Optional[date] = None
    signup_request_id: Optional[int] = None

    @field_validator("tenant_id")
    @classmethod
    def tenant_id_must_be_slug(cls, v: str) -> str:
        if not v or not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("tenant_id must be alphanumeric (with optional _ or -)")
        return v.lower()


class TenantResponse(BaseModel):
    """NEVER add db_connection_secret to this model."""
    id: int
    tenant_id: str
    school_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: str
    contact_phone: Optional[str] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None
    status: TenantStatus
    subscription_plan: Optional[str] = None
    subscription_expiry: Optional[date] = None
    last_activity_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TenantStatusUpdate(BaseModel):
    status: TenantStatus


class TenantSubscriptionUpdate(BaseModel):
    subscription_plan: Optional[str] = None
    subscription_expiry: Optional[date] = None


# ---------- Feature flags ----------

class FeatureFlagUpdate(BaseModel):
    enabled: bool


class FeatureFlagResponse(BaseModel):
    module: str
    enabled: bool


# ---------- Platform admin auth ----------

class PlatformAdminLogin(BaseModel):
    email: EmailStr
    password: str


class PlatformAdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Signup requests (Phase 2.5) ----------

class SignupCreate(BaseModel):
    school_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: EmailStr
    admin_name: str
    desired_subdomain: Optional[str] = None
    students_count: Optional[int] = None
    staff_count: Optional[int] = None
    selected_plan: Optional[str] = None
    # Honeypot field — must always arrive empty from real users (Phase 2.5, Day 2)
    website: Optional[str] = None


class SignupResponse(BaseModel):
    id: int
    school_name: str
    contact_email: str
    admin_name: str
    desired_subdomain: Optional[str] = None
    selected_plan: Optional[str] = None
    status: SignupStatus
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class SignupReject(BaseModel):
    rejection_reason: str
