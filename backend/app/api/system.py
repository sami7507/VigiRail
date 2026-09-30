"""
VigiRail — System API.

GET /api/status — public service overview (used by the dashboard System page)
GET /healthz    — public liveness/readiness probe (Render health checks)
"""

from __future__ import annotations

import time

from fastapi import APIRouter, Response, status

from app.core.config import settings
from app.ml.model import ml_model
from app.models.schemas import HealthResponse, SystemStatus
from app.services.state import app_state

router = APIRouter(tags=["system"])

_BOOT_TIME = time.time()


@router.get("/api/status", response_model=SystemStatus)
def status_endpoint() -> SystemStatus:
    """Public operational status of the API and model."""
    snapshot = app_state.snapshot()
    info = ml_model.model_info()
    return SystemStatus(
        api="online",
        app=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        ml_model=(
            f"{info['name']} ({info['trees']} trees) — "
            f"hold-out accuracy {info['test_accuracy'] * 100:.1f}%"
        ),
        failure_mode=snapshot["failure_mode"],
        uptime_seconds=round(time.time() - _BOOT_TIME, 1),
        uptime_ticks=snapshot["uptime_ticks"],
        alerts_today=snapshot["alerts_today"],
        history_count=snapshot["history_count"],
    )


@router.get("/healthz", response_model=HealthResponse, include_in_schema=False)
def healthz(response: Response) -> HealthResponse:
    """Readiness probe: 200 when the model is trained, 503 otherwise."""
    ready = ml_model.is_trained
    if not ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return HealthResponse(
        status="ok" if ready else "degraded",
        model_ready=ready,
        version=settings.app_version,
    )
