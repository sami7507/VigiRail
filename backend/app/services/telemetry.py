"""
VigiRail — Telemetry pipeline.

Single source of truth for turning simulator readings + model output into the
snapshot consumed by `/api/sensor-data` and the inspection report generator.

Side effects (tick counter, history, alerts, route progression) only happen
when ``record=True`` — report generation passes ``record=False`` so creating a
report never mutates live state.
"""

from __future__ import annotations

from datetime import UTC, datetime

from app.ml.model import ml_model
from app.models.fleet_data import get_train
from app.models.schemas import (
    HealthState,
    RouteStop,
    SensorDataResponse,
    StationInfo,
    TrainSummary,
)
from app.services.simulator import simulator
from app.services.state import app_state

DANGER_THRESHOLD = 0.70
WARN_THRESHOLD = 0.35
STATION_ADVANCE_TICKS = 30   # simulated journey progression
DANGER_REMINDER_TICKS = 20   # re-alert cadence while critical


def classify(failure_probability: float) -> HealthState:
    if failure_probability >= DANGER_THRESHOLD:
        return HealthState.DANGER
    if failure_probability >= WARN_THRESHOLD:
        return HealthState.WARN
    return HealthState.GOOD


def _alert_message(state: HealthState, train_id: str, station: StationInfo,
                   sensors, failure_mode: bool) -> str:
    if failure_mode:
        return (
            f"Failure simulation active — sensors on train {train_id} "
            f"are ramping into the danger zone near {station.name}."
        )
    if state is HealthState.DANGER:
        return (
            f"Critical: vibration {sensors.vibration} mm/s, bearing "
            f"{sensors.temperature} °C near {station.name}. Stop inspection required."
        )
    if state is HealthState.WARN:
        return (
            f"Elevated readings near {station.name} — schedule inspection "
            f"within 48 hours."
        )
    return f"All systems nominal near {station.name}. Train {train_id} is healthy."


def _build_route(train: dict, station_idx: int, live_health: int,
                 live_state: HealthState) -> list[RouteStop]:
    stops: list[RouteStop] = []
    train_id = train["number"]
    for i, stop in enumerate(train["route"]):
        if i < station_idx:
            status = "past"
            health = app_state.health_for_station(train_id, stop["code"])
        elif i == station_idx:
            status = "current"
            health = live_health
        else:
            status = "pending"
            health = None
        stops.append(RouteStop(**stop, status=status, health=health))
    return stops


def capture_snapshot(
    train_number: str,
    *,
    record: bool,
    logged_user: str = "",
    user_role: str = "",
) -> SensorDataResponse:
    """Build a full telemetry snapshot for ``train_number``.

    Raises ``LookupError`` if the train is unknown to the fleet catalogue.
    """
    train = get_train(train_number)
    if train is None:
        raise LookupError(train_number)

    failure_mode = app_state.failure_mode
    tick = app_state.advance_tick() if record else app_state.snapshot()["uptime_ticks"]

    # 1. Sensor stream + model inference ──────────────────────────────
    sensors = simulator.next(failure_mode)
    bogies = simulator.generate_bogies(failure_mode)
    preds = ml_model.predict(
        sensors.vibration, sensors.temperature, sensors.acoustic, sensors.wear
    )
    fp = preds["failure_probability"]
    state = classify(fp)

    # 2. Route progress ───────────────────────────────────────────────
    station_idx = app_state.station_index_for(train_number)
    station = StationInfo(**train["route"][station_idx])
    health_score = preds["health_score"]

    if record:
        app_state.set_station_health(train_number, station.code, health_score)
        # A train under failure simulation holds at the current station.
        if not failure_mode and tick % STATION_ADVANCE_TICKS == 0:
            app_state.advance_station(train_number, len(train["route"]))
            station_idx = app_state.station_index_for(train_number)
            station = StationInfo(**train["route"][station_idx])

    route = _build_route(train, station_idx, health_score, state)

    # 3. Edge-triggered alerting ──────────────────────────────────────
    message = _alert_message(state, train_number, station, sensors, failure_mode)
    if record:
        previous, current = app_state.note_state(train_number, state.value)
        if previous != current:
            if current == HealthState.DANGER.value:
                app_state.push_alert(message, "danger", train_number)
            elif current == HealthState.WARN.value:
                app_state.push_alert(message, "warn", train_number)
            elif previous in (HealthState.WARN.value, HealthState.DANGER.value):
                # Recovery notice — one per transition, counted as info.
                app_state.push_alert(
                    f"Recovered: train {train_number} back to normal operating range.",
                    "info",
                    train_number,
                )
        elif current == HealthState.DANGER.value and tick % DANGER_REMINDER_TICKS == 0:
            app_state.push_alert(message, "danger", train_number)

    # 4. History ──────────────────────────────────────────────────────
    if record:
        app_state.push_history(
            {
                "timestamp": datetime.now(UTC).isoformat(),
                "train_id": train_number,
                "state": state.value,
                "vibration": sensors.vibration,
                "temperature": sensors.temperature,
                "acoustic": sensors.acoustic,
                "wear": sensors.wear,
                "risk_pct": round(fp * 100, 1),
            }
        )

    return SensorDataResponse(
        timestamp=datetime.now(UTC),
        train_id=train_number,
        train=TrainSummary(**train, stations=len(train["route"])),
        current_station=station,
        route=route,
        state=state,
        health_score=health_score,
        failure_probability=round(fp * 100, 1),
        days_until_service=max(0, round((1 - fp) * 20)),
        alerts_today=app_state.snapshot()["alerts_today"],
        alert_message=message,
        sensors=sensors,
        bogies=bogies,
        predictions={
            "wheel_bearing_failure": round(preds["wheel_bearing"] * 100, 1),
            "track_damage_risk": round(preds["track_damage"] * 100, 1),
            "overheating_risk": round(preds["overheating"] * 100, 1),
            "brake_wear": round(preds["brake_wear"] * 100, 1),
        },
        feature_importance=preds["feature_importance"],
        model_confidence=round(preds["confidence"] * 100, 1),
        class_probabilities={
            label: round(value * 100, 1)
            for label, value in preds["class_probabilities"].items()
        },
        maintenance=simulator.get_maintenance(failure_mode, sensors),
        logged_user=logged_user,
        user_role=user_role,
    )
