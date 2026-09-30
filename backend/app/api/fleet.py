"""
VigiRail — Fleet API.

GET /api/trains — catalogue of monitored services (with routes).
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import AuthUser, get_current_user
from app.models.fleet_data import FLEET, get_train
from app.models.schemas import TrainListResponse, TrainSummary

router = APIRouter(prefix="/api", tags=["fleet"])


@router.get("/trains", response_model=TrainListResponse)
def list_trains(user: AuthUser = Depends(get_current_user)) -> TrainListResponse:
    """All trains in the monitored fleet, including station routes."""
    trains = [
        TrainSummary(**data, stations=len(data["route"])) for data in FLEET.values()
    ]
    return TrainListResponse(trains=trains)


@router.get("/trains/{train_number}", response_model=TrainSummary)
def get_train_detail(
    train_number: str, user: AuthUser = Depends(get_current_user)
) -> TrainSummary:
    """Details for one train, including its full route."""
    data = get_train(train_number)
    if data is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND, f"Unknown train '{train_number}'"
        )
    return TrainSummary(**data, stations=len(data["route"]))
