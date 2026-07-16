# mzbs-control-panel

Standalone FastAPI backend for the control plane — **not** part of the
school-facing `mzbs` application. See `docs/MULTI_TENANT_PLAN.md` (in the
`mzbs` repo) for the full architecture, especially Decisions #15-18.

## What lives here

- The `tenants`, `platform_admins`, `tenant_feature_flags`, and
  `signup_requests` tables — the **only** owner of this database (read+write).
- Platform-admin authentication (JWT, separate signing secret from mzbs's
  school-user tokens).
- Tenant CRUD, subscription/feature-flag management, sign-up approval.
- The canonical `tenant_lookup.py` (mzbs holds a read-only mirrored copy).

## What does NOT live here

- Anything school-data-specific (students, fees, attendance, exam marks) —
  that stays entirely inside `mzbs` and each school's own database.
- No school ever authenticates against this service.

## Relationship to `mzbs`

Both this service and `mzbs` connect **directly** to the same control-plane
Postgres database — there is no HTTP call between the two repos for
anything on the login-critical path (Decision #16). This service is the
only one with write access; `mzbs`'s copy only ever runs `SELECT`s.

## Setup

```bash
cp .env.example .env   # fill in real values
uv sync
uv run python migrations/add_control_plane_tables.py   # one-time table creation
uv run uvicorn main:app --reload
```
