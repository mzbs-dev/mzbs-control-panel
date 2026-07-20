from urllib.parse import urlparse, urlunparse

from sqlmodel import SQLModel, create_engine, Session

import setting
from utils.logging import logger

# Import models so SQLModel.metadata knows about them before create_all()
import control_plane.models  # noqa: F401

CONN_STRING: str = str(setting.CONTROL_PLANE_DATABASE_URL)


def _normalize_database_url(raw_url: str) -> str:
    """Use a SQLAlchemy-compatible dialect based on the available DB driver.
    Mirrors mzbs's db.py exactly, so both repos behave identically here."""
    if not raw_url or raw_url == "None":
        return raw_url

    if raw_url.startswith("postgresql+"):
        return raw_url

    parsed = urlparse(raw_url)
    if parsed.scheme in {"postgresql", "postgres"}:
        try:
            import psycopg2  # noqa: F401
            return urlunparse(parsed._replace(scheme="postgresql+psycopg2"))
        except Exception:
            try:
                import psycopg  # noqa: F401
                return urlunparse(parsed._replace(scheme="postgresql+psycopg"))
            except Exception:
                return raw_url

    return raw_url


if not CONN_STRING or CONN_STRING == "None":
    logger.error("CONTROL_PLANE_DATABASE_URL is not configured!")
    raise ValueError("CONTROL_PLANE_DATABASE_URL environment variable is required but not set")


def get_engine(conn_string: str):
    connect_args = {"connect_timeout": 10}
    normalized_url = _normalize_database_url(conn_string)
    engine = create_engine(
        normalized_url,
        echo=False,  # keep off here — this DB is small/low-traffic but holds sensitive rows
        connect_args=connect_args,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        pool_pre_ping=True,
    )
    logger.info("Control-plane engine created successfully")
    return engine


engine = get_engine(CONN_STRING)
SessionLocal = Session


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


# NOTE: app startup/shutdown lifecycle (create_db_and_tables + engine.dispose)
# lives in main.py's `lifespan()`, which is the one actually registered with
# FastAPI(lifespan=...). This module previously defined a second, unused
# `lifespan()` here that duplicated that logic and was never wired up —
# removed to avoid the two drifting out of sync silently.


def get_control_plane_session():
    """FastAPI dependency — yields a session against the control-plane DB.
    This service owns read+write access (Decision #16)."""
    session = None
    try:
        session = SessionLocal(engine)
        yield session
    except Exception as e:
        logger.error(f"Control-plane session error: {str(e)}")
        raise
    finally:
        if session:
            session.close()
