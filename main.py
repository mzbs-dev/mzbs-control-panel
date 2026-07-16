from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from fastapi import Request

import setting
from utils.logging import logger, cleanup_old_logs
from control_plane.db import create_db_and_tables, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting mzbs-control-panel")
    create_db_and_tables()
    logger.info("Control-plane tables ready")
    try:
        cleanup_old_logs()
    except Exception as e:
        logger.error(f"Failed to clean up logs: {str(e)}")

    yield

    logger.info("mzbs-control-panel shutting down...")
    await engine.dispose()


app = FastAPI(
    title="mzbs-control-panel",
    description="Control plane: tenant directory, platform-admin auth, sign-up approval, subscriptions",
    version="0.1.0",
    openapi_url="/docs/json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    logger.warning(f"Rate limit exceeded for IP: {request.client.host}")
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


# CORS: only the mzbs-platform frontend (marketing + admin dashboard) needs
# to reach this service — never a school's own frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=setting.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type"],
    max_age=3600,
)

# Router registration — added once control_plane/router.py exists
# (Phase 2, Day 3 and Phase 2.5, Day 1):
# from control_plane.router import platform_router
# app.include_router(platform_router)


@app.get("/", tags=["mzbs-control-panel"])
async def root():
    return {"message": "mzbs-control-panel is running"}
