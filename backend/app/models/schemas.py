"""
VigiRail — Pydantic schemas.

Every public endpoint declares a `response_model`, so the shapes below are the
enforced API contract (they also generate the OpenAPI docs at /docs).
"""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────
class HealthState(StrEnum):
    GOOD = "good"
    WARN = "warn"
    DANGER = "danger"


class Urgency(StrEnum):
    URGENT = "urgent"
    SOON = "soon"
    PLANNED = "planned"
    OK = "ok"


# ── Auth ───────────────────────────────────────────────────────────────
class LoginResponse(BaseModel):
    access_token: str = Field(..., description="JWT bearer token")
    token_type: str = "bearer"
    username: str
    role: str
    full_name: str
    expires_in_minutes: int


class UserOut(BaseModel):
    username: str
    role: str
    full_name: str


# ── Sensors / telemetry ────────────────────────────────────────────────
class SensorReading(BaseModel):
    vibration: float = Field(..., ge=0, description="Vibration (mm/s)")
    temperature: float = Field(..., ge=0, description="Axle bearing temperature (°C)")
    acoustic: float = Field(..., ge=0, description="Acoustic level (dB)")
    wear: float = Field(..., ge=0, le=100, description="Rail / component wear (%)")


class BogieStatus(BaseModel):
    id: str
    label: str
    status: HealthState
    temp: int = Field(..., description="Bogie bearing temperature (°C)")


class MaintenanceItem(BaseModel):
    title: str
    detail: str
    urgency: Urgency


class StationInfo(BaseModel):
    code: str
    name: str
    km: int
    state: str


class RouteStop(BaseModel):
    code: str
    name: str
    km: int
    state: str
    status: Literal["past", "current", "pending"]
    health: int | None = Field(None, description="Health score when visited/current")


class TrainSummary(BaseModel):
    number: str
    name: str
    zone: str
    zone_code: str
    type: str
    from_station: str = Field(..., alias="from")
    to_station: str = Field(..., alias="to")
    distance_km: int
    avg_speed_kmh: int
    rake_type: str
    stations: int
    route: list[StationInfo]

    model_config = {"populate_by_name": True}


class ComponentRisks(BaseModel):
    wheel_bearing_failure: float = Field(..., description="% risk")
    track_damage_risk: float
    overheating_risk: float
    brake_wear: float


class SensorDataResponse(BaseModel):
    timestamp: datetime
    train_id: str
    train: TrainSummary
    current_station: StationInfo
    route: list[RouteStop]
    state: HealthState
    health_score: int = Field(..., ge=0, le=100)
    failure_probability: float = Field(..., ge=0, le=100, description="Percent")
    days_until_service: int = Field(..., ge=0)
    alerts_today: int = Field(..., ge=0)
    alert_message: str
    sensors: SensorReading
    bogies: list[BogieStatus]
    predictions: ComponentRisks
    feature_importance: dict[str, float]
    model_confidence: float
    class_probabilities: dict[str, float]
    maintenance: list[MaintenanceItem]
    logged_user: str
    user_role: str


# ── Predictions ────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    vibration: float = Field(..., ge=0, le=30, description="mm/s")
    temperature: float = Field(..., ge=0, le=200, description="°C")
    acoustic: float = Field(..., ge=0, le=150, description="dB")
    wear: float = Field(..., ge=0, le=100, description="%")


class PredictionResponse(BaseModel):
    failure_probability: float
    health_score: int
    state: HealthState
    component_risks: dict[str, float]
    feature_importance: dict[str, float]
    model_confidence: float


# ── History / alerts ───────────────────────────────────────────────────
class HistoryRecord(BaseModel):
    timestamp: datetime
    train_id: str
    state: HealthState
    vibration: float
    temperature: float
    acoustic: float
    wear: float
    risk_pct: float


class HistoryPage(BaseModel):
    total: int
    offset: int
    limit: int
    records: list[HistoryRecord]


class AlertRecord(BaseModel):
    id: int
    timestamp: datetime
    train_id: str
    message: str
    severity: Literal["info", "warn", "danger"]
    read: bool = False


class AlertList(BaseModel):
    alerts: list[AlertRecord]
    total_today: int
    unread_count: int


# ── Simulation / fleet / system ────────────────────────────────────────
class SimulateRequest(BaseModel):
    failure: bool


class SimulateResponse(BaseModel):
    status: Literal["ok"]
    failure_mode: bool
    message: str


class TrainListResponse(BaseModel):
    trains: list[TrainSummary]


class SystemStatus(BaseModel):
    api: str
    app: str
    version: str
    environment: str
    ml_model: str
    failure_mode: bool
    uptime_seconds: float
    uptime_ticks: int
    alerts_today: int
    history_count: int


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    model_ready: bool
    version: str


# ── Reports ────────────────────────────────────────────────────────────
class ReportMeta(BaseModel):
    report_id: str
    generated_at: datetime
    train_id: str
    generated_by: str
