"""
Shared rate limiter for public endpoints. The /signup endpoint (Phase 2.5)
is the first fully public, unauthenticated write endpoint in the system —
treated with the same care as a login endpoint (per MULTI_TENANT_PLAN.md
Post-Launch Notes).
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
