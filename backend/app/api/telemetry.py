"""
VigiRail — Telemetry API.

GET  /api/sensor-data  — live snapshot (polling endpoint, every ~2 s)
GET  /api/history      — paginated reading history (optional ?train= filter)
GET  /api/alerts       — recent alert records
POST /api/simulate     — toggle the failure simulator (Admin / Engineer)
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import AuthUser, get_current_user, require_roles
from app.core.users import ROLE_ADMIN, ROLE_ENGINEER
from app.models.fleet_data import FLEET
from app.models.schemas import (
    AlertList,
    HistoryPage,
    SensorDataResponse,
    SimulateRequest,
    SimulateResponse,
)
from app.services.simulator import simulator
from app.services.state import app_state
from app.services.telemetry import capture_snapshot

logger = logging.getLogger("vigirail.telemetry")

router = APIRouter(prefix="/api", tags=["telemetry"])


@router.get("/sensor-data", response_model=SensorDataResponse)
def get_sensor_data(
    train: str = Query("12951", description="Train number from /api/trains"),
    user: AuthUser = Depends(get_current_user),
) -> SensorDataResponse:
    """Live sensor readings + model output for one train.

    This is the main polling endpoint; calling it advances the simulated
    journey, appends to history, and fires edge-triggered alerts.
    """
    try:
        snapshot = capture_snapshot(
            train, record=True, logged_user=user.username, user_role=user.role
        )
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown train '{train}'. Use GET /api/trains for the fleet list.",
        ) from None
    return snapshot


@router.get("/history", response_model=HistoryPage)
def get_history(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    train: str | None = Query(None, description="Optional train number filter"),
    user: AuthUser = Depends(get_current_user),
) -> HistoryPage:
    """Newest-first, paginated history of readings and predictions."""
    if train is not None and train not in FLEET:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Unknown train '{train}'")
    total, records = app_state.history_page(limit=limit, offset=offset, train=train)
    return HistoryPage(total=total, offset=offset, limit=limit, records=records)


@router.get("/alerts", response_model=AlertList)
def get_alerts(
    limit: int = Query(20, ge=1, le=100),
    user: AuthUser = Depends(get_current_user),
) -> AlertList:
    """Most recent alerts (newest first)."""
    return AlertList(**app_state.alerts_page(limit=limit))


@router.post("/simulate", response_model=SimulateResponse)
def toggle_simulation(
    body: SimulateRequest,
    user: AuthUser = Depends(require_roles(ROLE_ADMIN, ROLE_ENGINEER)),
) -> SimulateResponse:
    """Start or stop the failure-injection simulator (engineers only)."""
    if body.failure:
        app_state.set_failure_mode(True)
        app_state.push_alert(
            f"Failure simulation started by {user.username}.", "info", "—"
        )
        message = "Failure simulation started"
        logger.info("Simulation ON by %s", user.username)
    else:
        app_state.set_failure_mode(False)
        simulator.reset()
        app_state.push_alert(
            f"System reset to normal by {user.username}.", "info", "—"
        )
        message = "System reset to normal"
        logger.info("Simulation OFF by %s", user.username)
    return SimulateResponse(status="ok", failure_mode=body.failure, message=message)
