"""
RailGuard AI — Pydantic Schemas
All request/response data models used by the API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class HealthState(str, Enum):
    GOOD   = "good"
    WARN   = "warn"
    DANGER = "danger"


class SensorReading(BaseModel):
    vibration:   float = Field(..., ge=0, description="Vibration in mm/s")
    temperature: float = Field(..., ge=0, description="Temperature in °C")
    acoustic:    float = Field(..., ge=0, description="Acoustic level in dB")
    wear:        float = Field(..., ge=0, le=100, description="Track wear %")


class BogieStatus(BaseModel):
    id:     str
    label:  str
    status: HealthState
    temp:   int


class PredictionResult(BaseModel):
    failure_probability: float
    health_score:        int
    state:               HealthState
    wheel_bearing:       float
    track_damage:        float
    overheating:         float
    brake_wear:          float
    confidence:          float
    feature_importance:  dict


class SensorDataResponse(BaseModel):
    timestamp:           str
    train_id:            str
    state:               HealthState
    health_score:        int
    failure_probability: float
    days_until_service:  int
    alerts_today:        int
    alert_message:       str
    sensors:             SensorReading
    bogies:              list[BogieStatus]
    predictions:         dict
    feature_importance:  dict
    model_confidence:    float
    maintenance:         list[dict]
    logged_user:         str
    user_role:           str


class SimulateRequest(BaseModel):
    failure: bool


class LoginResponse(BaseModel):
    access_token: str
    token_type:   str
    username:     str
    role:         str
    full_name:    str


class HistoryRecord(BaseModel):
    timestamp:   str
    train_id:    str
    state:       HealthState
    vib:         float
    temp:        float
    acou:        float
    wear:        float
    risk_pct:    float
    triggered_by: Optional[str] = None


class AlertRecord(BaseModel):
    id:        int
    timestamp: str
    train_id:  str
    message:   str
    severity:  str   # info | warn | danger
    read:      bool = False
