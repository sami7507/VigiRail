"""
VigiRail — Prediction API.

POST /api/predict — run the failure-risk model on an arbitrary sensor snapshot.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.deps import AuthUser, require_roles
from app.core.users import ROLE_ADMIN, ROLE_ENGINEER
from app.ml.model import ml_model
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.telemetry import classify

router = APIRouter(prefix="/api", tags=["predict"])


@router.get("/model")
def model_info(
    user: AuthUser = Depends(require_roles(ROLE_ADMIN, ROLE_ENGINEER)),
) -> dict:
    """Training metrics and feature importances for the fitted model."""
    from app.ml.model import ml_model as _ml_model

    return _ml_model.model_info()


@router.post("/predict", response_model=PredictionResponse)
def predict(
    body: PredictionRequest,
    user: AuthUser = Depends(require_roles(ROLE_ADMIN, ROLE_ENGINEER)),
) -> PredictionResponse:
    """Score an arbitrary sensor snapshot (bounds validated by the schema)."""
    result = ml_model.predict(
        body.vibration, body.temperature, body.acoustic, body.wear
    )
    fp = result["failure_probability"]
    return PredictionResponse(
        failure_probability=round(fp * 100, 1),
        health_score=result["health_score"],
        state=classify(fp),
        component_risks={
            "wheel_bearing": round(result["wheel_bearing"] * 100, 1),
            "track_damage": round(result["track_damage"] * 100, 1),
            "overheating": round(result["overheating"] * 100, 1),
            "brake_wear": round(result["brake_wear"] * 100, 1),
        },
        feature_importance=result["feature_importance"],
        model_confidence=round(result["confidence"] * 100, 1),
    )
