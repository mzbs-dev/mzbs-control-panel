"""
Control-plane database models.

Per MULTI_TENANT_PLAN.md Phase 2 + Decision #11: the `Tenant` model is the
single source of truth for everything about a school (not just its DB
connection secret) so the Super-Admin panel never needs to reach into a
school's own database for basic tenant info.

This DB deliberately excludes anything school-DATA-specific (students,
fees, attendance) — those live inside each school's own isolated database.
"""

from datetime import datetime, date
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field


class TenantStatus(str, Enum):
    PROVISIONING = "provisioning"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    EXPIRED = "expired"


class SignupStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Tenant(SQLModel, table=True):
    __tablename__ = "tenants"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Identity
    tenant_id: str = Field(unique=True, index=True, description="Slug used in frontend NEXT_PUBLIC_TENANT_ID")

    # School info
    school_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None

    # Contact
    contact_email: str
    contact_phone: Optional[str] = None

    # School's own ADMIN contact (not a login credential — that lives in
    # the school's own database, per Phase 1's role system)
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None

    # Deployment
    frontend_url: Optional[str] = None
    backend_url: Optional[str] = None  # null while all tenants share one backend

    # The encrypted connection string — see control_plane/crypto.py.
    # NEVER return this field in any API response (see schemas/control_plane_schemas.py).
    db_connection_secret: str

    # Lifecycle
    status: TenantStatus = Field(default=TenantStatus.PROVISIONING)

    # Billing (Decision #14 — manual for now, no payment processor)
    subscription_plan: Optional[str] = None
    subscription_expiry: Optional[date] = None

    # Link back to the signup request that created this tenant, if any
    # (null for tenants created manually via the admin panel)
    signup_request_id: Optional[int] = Field(default=None, foreign_key="signup_requests.id")

    last_activity_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PlatformAdmin(SQLModel, table=True):
    __tablename__ = "platform_admins"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None


class TenantFeatureFlag(SQLModel, table=True):
    __tablename__ = "tenant_feature_flags"

    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: int = Field(foreign_key="tenants.id", index=True)
    module: str
    enabled: bool = Field(default=True)


class SignupRequest(SQLModel, table=True):
    """Phase 2.5 — public sign-up form submissions, pending review."""
    __tablename__ = "signup_requests"

    id: Optional[int] = Field(default=None, primary_key=True)

    school_name: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    contact_phone: Optional[str] = None
    contact_email: str
    admin_name: str

    desired_subdomain: Optional[str] = None
    students_count: Optional[int] = None
    staff_count: Optional[int] = None
    selected_plan: Optional[str] = None

    status: SignupStatus = Field(default=SignupStatus.PENDING)
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = Field(default=None, foreign_key="platform_admins.id")
    rejection_reason: Optional[str] = None
