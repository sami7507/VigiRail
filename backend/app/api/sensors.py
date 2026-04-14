"""
RailGuard AI — Sensor & Prediction API Routes
GET  /api/sensor-data   → live sensor readings + ML output
GET  /api/predict       → ML prediction for given sensor values
GET  /api/history       → paginated history log
GET  /api/alerts        → alert records
POST /api/simulate      → toggle failure simulation
GET  /api/trains        → list of trains
GET  /api/status        → system health check
"""
from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
from app.core.auth import decode_token
from app.ml.model import ml_model
from app.services.simulator import simulator
from app.services.state import app_state

router       = APIRouter(prefix="/api", tags=["sensors"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency: validates JWT and returns user payload."""
    payload = decode_token(token)
    return {"username": payload["sub"]}


# ── GET /api/sensor-data ─────────────────────────────────────────
@router.get("/sensor-data")
def get_sensor_data(
    train: str = Query("12951"),
    user:  dict = Depends(current_user),
):
    """
    Main polling endpoint called every 2 seconds by the frontend.
    Returns live sensor readings, ML predictions, bogie status,
    and contextual maintenance recommendations.
    """
    app_state.tick += 1
    failure = app_state.failure_mode

    # Generate sensor readings
    sensors = simulator.next(failure)
    bogies  = simulator.generate_bogies(failure)

    # Run ML model
    preds   = ml_model.predict(
        sensors.vibration, sensors.temperature,
        sensors.acoustic,  sensors.wear,
    )
    fp = preds["failure_probability"]

    # Classify state
    if fp >= 0.70:
        state       = "danger"
        alert_msg   = "🚨 CRITICAL: Multiple sensors in danger zone. Stop train immediately!"
        app_state.push_alert(alert_msg, "danger", train)
        app_state.alerts_today += 1
    elif fp >= 0.35:
        state     = "warn"
        alert_msg = "⚠️ Elevated readings detected. Schedule maintenance within 48 hours."
        if app_state.tick % 5 == 0:
            app_state.push_alert(alert_msg, "warn", train)
    else:
        state     = "good"
        alert_msg = "✅ All systems normal. Train is in good health."

    days_service = max(0, round((1 - fp) * 20))

    # Push to history
    app_state.push_history({
        "timestamp": datetime.now().isoformat(),
        "train_id":  train,
        "state":     state,
        "vib":       sensors.vibration,
        "temp":      sensors.temperature,
        "acou":      sensors.acoustic,
        "wear":      sensors.wear,
        "risk_pct":  round(fp * 100, 1),
    })

    return {
        "timestamp":           datetime.now().isoformat(),
        "train_id":            train,
        "state":               state,
        "health_score":        preds["health_score"],
        "failure_probability": round(fp * 100, 1),
        "days_until_service":  days_service,
        "alerts_today":        app_state.alerts_today,
        "alert_message":       alert_msg,
        "sensors": {
            "vibration":   sensors.vibration,
            "temperature": sensors.temperature,
            "acoustic":    sensors.acoustic,
            "wear":        sensors.wear,
        },
        "bogies": [b.model_dump() for b in bogies],
        "predictions": {
            "wheel_bearing_failure": round(preds["wheel_bearing"]  * 100, 1),
            "track_damage_risk":     round(preds["track_damage"]   * 100, 1),
            "overheating_risk":      round(preds["overheating"]    * 100, 1),
            "brake_wear":            round(preds["brake_wear"]     * 100, 1),
        },
        "feature_importance":  preds["feature_importance"],
        "model_confidence":    round(preds["confidence"] * 100, 1),
        "maintenance":         simulator.get_maintenance(failure, sensors),
        "logged_user":         user["username"],
    }


# ── GET /api/predict ─────────────────────────────────────────────
@router.get("/predict")
def predict(
    vibration:   float = Query(2.5),
    temperature: float = Query(55.0),
    acoustic:    float = Query(42.0),
    wear:        float = Query(18.0),
    user:        dict  = Depends(current_user),
):
    """Direct ML prediction for given sensor values (used by Engineer tab)."""
    result = ml_model.predict(vibration, temperature, acoustic, wear)
    fp     = result["failure_probability"]
    return {
        "failure_probability": round(fp * 100, 1),
        "health_score":        result["health_score"],
        "state":               "danger" if fp >= 0.70 else "warn" if fp >= 0.35 else "good",
        "component_risks": {
            "wheel_bearing": round(result["wheel_bearing"]  * 100, 1),
            "track_damage":  round(result["track_damage"]   * 100, 1),
            "overheating":   round(result["overheating"]    * 100, 1),
            "brake_wear":    round(result["brake_wear"]     * 100, 1),
        },
        "feature_importance": result["feature_importance"],
        "model_confidence":   round(result["confidence"] * 100, 1),
    }


# ── GET /api/history ─────────────────────────────────────────────
@router.get("/history")
def get_history(
    limit:  int  = Query(50, le=200),
    offset: int  = Query(0),
    user:   dict = Depends(current_user),
):
    """Paginated history of all sensor readings and predictions."""
    all_records = list(app_state.history)
    return {
        "total":   len(all_records),
        "offset":  offset,
        "limit":   limit,
        "records": all_records[offset:offset + limit],
    }


# ── GET /api/alerts ──────────────────────────────────────────────
@router.get("/alerts")
def get_alerts(
    limit: int  = Query(20),
    user:  dict = Depends(current_user),
):
    """Recent alert records for the alert panel."""
    return {
        "alerts":       list(app_state.alerts)[:limit],
        "total_today":  app_state.alerts_today,
        "unread_count": sum(1 for a in app_state.alerts if not a["read"]),
    }


# ── POST /api/simulate ───────────────────────────────────────────
@router.post("/simulate")
def toggle_simulation(
    body: dict,
    user: dict = Depends(current_user),
):
    """Toggle failure simulation on/off. Body: {failure: bool}"""
    failure = body.get("failure", False)
    app_state.failure_mode = failure
    if not failure:
        simulator.reset()
        app_state.alerts_today = 0
    msg = "Failure simulation ON" if failure else "System reset to normal"
    print(f"[SIM] {msg} by {user['username']}")
    app_state.push_alert(
        f"{'🔴' if failure else '✅'} {msg} by {user['username']}",
        "danger" if failure else "info",
        app_state.selected_train,
    )
    return {"status": "ok", "failure_mode": failure, "message": msg}


# ── GET /api/trains ──────────────────────────────────────────────
@router.get("/trains")
def get_trains(user: dict = Depends(current_user)):
    """List of all available trains."""
    return {
        "trains": [
            {"no": "12951", "name": "Mumbai Rajdhani Express",  "zone": "WR",  "type": "Rajdhani"},
            {"no": "12301", "name": "Howrah Rajdhani Express",  "zone": "ER",  "type": "Rajdhani"},
            {"no": "12002", "name": "Bhopal Shatabdi Express",  "zone": "NCR", "type": "Shatabdi"},
            {"no": "22691", "name": "Bangalore Rajdhani",       "zone": "SWR", "type": "Rajdhani"},
            {"no": "12627", "name": "Karnataka Express",        "zone": "SWR", "type": "Express"},
            {"no": "12565", "name": "Bihar Sampark Kranti",     "zone": "ECR", "type": "Express"},
            {"no": "12909", "name": "Garib Rath Express",       "zone": "WR",  "type": "Garib Rath"},
            {"no": "20501", "name": "Vande Bharat Express",     "zone": "NR",  "type": "Vande Bharat"},
        ]
    }


# ── GET /api/status ──────────────────────────────────────────────
@router.get("/status")
def get_status():
    """System health check — no auth required."""
    return {
        "api":           "online ✅",
        "ml_model":      f"RandomForest v1.0 — accuracy {ml_model.accuracy * 100:.1f}%",
        "failure_mode":  app_state.failure_mode,
        "uptime_ticks":  app_state.tick,
        "alerts_today":  app_state.alerts_today,
        "history_count": len(app_state.history),
    }
