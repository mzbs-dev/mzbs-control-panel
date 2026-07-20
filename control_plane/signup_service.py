"""
Phase 2.5 — sign-up request service.

approve_signup_request() creates a `tenants` row in PROVISIONING status
and links it back to the signup request. It deliberately does NOT create
a database, deploy a frontend, or create a login — those stay manual
(Decision #13), now working from structured data instead of an email
thread.
"""

from datetime import datetime
from typing import Optional

from fastapi import HTTPException
from sqlmodel import Session, select

from control_plane.crypto import encrypt_connection_string
from control_plane.models import SignupRequest, SignupStatus, Tenant, TenantStatus
from control_plane.tenant_service import get_tenant_by_id
from schemas.control_plane_schemas import SignupCreate
from utils.logging import logger


def create_signup_request(session: Session, payload: SignupCreate) -> SignupRequest:
    # Honeypot check: real users never fill this hidden field.
    if payload.website:
        logger.warning(f"Honeypot triggered on signup from '{payload.contact_email}' — discarding silently")
        # Return a fake-successful-looking object without persisting anything,
        # so the bot gets a 200 and doesn't learn to adapt.
        return SignupRequest(
            id=-1,
            school_name=payload.school_name,
            contact_email=payload.contact_email,
            admin_name=payload.admin_name,
            status=SignupStatus.PENDING,
            submitted_at=datetime.utcnow(),
        )

    signup = SignupRequest(
        school_name=payload.school_name,
        address=payload.address,
        city=payload.city,
        country=payload.country,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        admin_name=payload.admin_name,
        desired_subdomain=payload.desired_subdomain,
        students_count=payload.students_count,
        staff_count=payload.staff_count,
        selected_plan=payload.selected_plan,
    )
    session.add(signup)
    session.commit()
    session.refresh(signup)
    logger.info(f"New signup request #{signup.id} from '{signup.school_name}'")
    return signup


def list_signup_requests(session: Session, status: Optional[SignupStatus] = None) -> list[SignupRequest]:
    query = select(SignupRequest)
    if status is not None:
        query = query.where(SignupRequest.status == status)
    return list(session.exec(query).all())


def get_signup_request(session: Session, signup_id: int) -> Optional[SignupRequest]:
    return session.get(SignupRequest, signup_id)


def approve_signup_request(
    session: Session,
    signup_id: int,
    reviewer_id: int,
    tenant_id: str,
    raw_connection_string: str,
) -> Tenant:
    signup = get_signup_request(session, signup_id)
    if not signup:
        raise HTTPException(status_code=404, detail="Unknown signup request")
    if signup.status != SignupStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Signup request is already '{signup.status}'")

    # Subdomain/tenant_id collision check (Phase 2.5, Day 4 requirement).
    if get_tenant_by_id(session, tenant_id):
        raise HTTPException(status_code=400, detail=f"tenant_id '{tenant_id}' already exists — choose a different one")

    tenant = Tenant(
        tenant_id=tenant_id,
        school_name=signup.school_name,
        address=signup.address,
        city=signup.city,
        country=signup.country,
        contact_email=signup.contact_email,
        contact_phone=signup.contact_phone,
        admin_name=signup.admin_name,
        admin_email=signup.contact_email,
        db_connection_secret=encrypt_connection_string(raw_connection_string),
        status=TenantStatus.PROVISIONING,
        subscription_plan=signup.selected_plan,
        signup_request_id=signup.id,
    )
    session.add(tenant)

    signup.status = SignupStatus.APPROVED
    signup.reviewed_at = datetime.utcnow()
    signup.reviewed_by = reviewer_id
    session.add(signup)

    session.commit()
    session.refresh(tenant)
    logger.info(f"Signup #{signup_id} approved -> tenant '{tenant_id}' created (status=provisioning)")
    return tenant


def reject_signup_request(session: Session, signup_id: int, reviewer_id: int, reason: str) -> SignupRequest:
    signup = get_signup_request(session, signup_id)
    if not signup:
        raise HTTPException(status_code=404, detail="Unknown signup request")
    if signup.status != SignupStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Signup request is already '{signup.status}'")

    signup.status = SignupStatus.REJECTED
    signup.reviewed_at = datetime.utcnow()
    signup.reviewed_by = reviewer_id
    signup.rejection_reason = reason
    session.add(signup)
    session.commit()
    session.refresh(signup)
    logger.info(f"Signup #{signup_id} rejected: {reason}")
    return signup
