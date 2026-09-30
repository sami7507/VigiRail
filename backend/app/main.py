"""
VigiRail — FastAPI application entry point.

Run locally:
    uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import auth, fleet, predict, reports, system, telemetry
from app.core.config import settings
from app.ml.model import ml_model

logger = logging.getLogger("vigirail")

BOOT_TIME = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Train the model once at startup, then serve."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-7s %(name)s — %(message)s",
        datefmt="%H:%M:%S",
    )
    logger.info("=" * 58)
    logger.info("  %s v%s — starting (%s)", settings.app_name,
                settings.app_version, settings.environment)
    logger.info("=" * 58)
    started = time.perf_counter()
    metrics = ml_model.train()
    logger.info(
        "Model ready in %.2fs — hold-out accuracy %.1f%%, macro-F1 %.3f",
        time.perf_counter() - started,
        metrics["test_accuracy"] * 100,
        metrics["test_macro_f1"],
    )
    yield
    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Predictive maintenance API for railway rolling stock. "
        "Streams simulated IoT sensor telemetry, scores failure risk with a "
        "Random Forest model, and serves role-based dashboards."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url=None,
)

# ── CORS — explicit allow-list (never a wildcard) ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)

# ── Routers ────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(telemetry.router)
app.include_router(predict.router)
app.include_router(fleet.router)
app.include_router(reports.router)
app.include_router(system.router)


# ── Cross-cutting middleware ───────────────────────────────────────────
@app.middleware("http")
async def request_context(request: Request, call_next):
    """Request ID + security headers + latency logging."""
    request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex[:12])
    started = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - started) * 1000

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    path = request.url.path
    if not path.startswith(("/docs", "/openapi")):
        logger.info(
            "%s %s → %d (%.1f ms) rid=%s",
            request.method, path, response.status_code, elapsed_ms, request_id,
        )
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Never leak stack traces to clients."""
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# ── Root ───────────────────────────────────────────────────────────────
@app.get("/", tags=["root"])
def root() -> dict:
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs",
        "health": "/healthz",
        "uptime_seconds": round(time.time() - BOOT_TIME, 1),
    }
