"""Telemetry, fleet, simulation and RBAC tests."""

from __future__ import annotations

from fastapi.testclient import TestClient

from tests.conftest import auth_header, login


def test_sensor_data_requires_auth(client: TestClient):
    assert client.get("/api/sensor-data").status_code == 401


def test_sensor_data_contract(client: TestClient):
    token = login(client)
    response = client.get(
        "/api/sensor-data", params={"train": "12951"}, headers=auth_header(token)
    )
    assert response.status_code == 200
    body = response.json()

    for key in (
        "timestamp", "train_id", "train", "current_station", "route", "state",
        "health_score", "failure_probability", "days_until_service",
        "alerts_today", "alert_message", "sensors", "bogies", "predictions",
        "feature_importance", "model_confidence", "maintenance",
        "logged_user", "user_role",
    ):
        assert key in body, f"missing {key}"

    assert body["train_id"] == "12951"
    assert body["state"] in ("good", "warn", "danger")
    assert body["logged_user"] == "admin"
    assert body["user_role"] == "Admin"
    assert len(body["bogies"]) == 6
    assert 0 <= body["health_score"] <= 100
    assert 0 <= body["failure_probability"] <= 100
    # Route: exactly one current stop, in order, ending at the destination.
    statuses = [stop["status"] for stop in body["route"]]
    assert statuses.count("current") == 1
    assert statuses[-1] in ("pending", "current")
    # Bogie status values are valid enum members.
    assert all(b["status"] in ("good", "warn", "danger") for b in body["bogies"])


def test_sensor_data_unknown_train_404(client: TestClient):
    token = login(client)
    response = client.get(
        "/api/sensor-data", params={"train": "99999"}, headers=auth_header(token)
    )
    assert response.status_code == 404


def test_history_pagination_and_filter(client: TestClient):
    token = login(client)
    headers = auth_header(token)
    for _ in range(3):
        client.get("/api/sensor-data", params={"train": "12951"}, headers=headers)
    client.get("/api/sensor-data", params={"train": "12002"}, headers=headers)

    page = client.get("/api/history", params={"limit": 2, "offset": 0}, headers=headers)
    assert page.status_code == 200
    body = page.json()
    assert body["limit"] == 2
    assert len(body["records"]) == 2
    assert body["total"] >= 4

    filtered = client.get(
        "/api/history", params={"train": "12002", "limit": 50}, headers=headers
    ).json()
    assert filtered["total"] >= 1
    assert all(r["train_id"] == "12002" for r in filtered["records"])

    assert client.get(
        "/api/history", params={"train": "42"}, headers=headers
    ).status_code == 404


def test_trains_fleet(client: TestClient):
    token = login(client)
    response = client.get("/api/trains", headers=auth_header(token))
    assert response.status_code == 200
    trains = response.json()["trains"]
    assert len(trains) >= 6
    rajdhani = next(t for t in trains if t["number"] == "12951")
    assert rajdhani["from"] == "Mumbai Central"
    assert len(rajdhani["route"]) == 6
    assert rajdhani["stations"] == 6

    detail = client.get("/api/trains/12301", headers=auth_header(token))
    assert detail.status_code == 200
    assert detail.json()["name"] == "Howrah Rajdhani Express"
    assert client.get("/api/trains/00000", headers=auth_header(token)).status_code == 404


# ── RBAC ───────────────────────────────────────────────────────────────
def test_simulate_rbac(client: TestClient):
    operator_token = login(client, "operator", "ops789")
    engineer_token = login(client, "engineer", "eng456")

    forbidden = client.post(
        "/api/simulate", json={"failure": True}, headers=auth_header(operator_token)
    )
    assert forbidden.status_code == 403

    allowed = client.post(
        "/api/simulate", json={"failure": True}, headers=auth_header(engineer_token)
    )
    assert allowed.status_code == 200
    assert allowed.json()["failure_mode"] is True

    # Clean up: switch simulation back off.
    reset = client.post(
        "/api/simulate", json={"failure": False}, headers=auth_header(engineer_token)
    )
    assert reset.status_code == 200
    assert reset.json()["failure_mode"] is False


def test_failure_simulation_ramps_into_danger(client: TestClient):
    engineer_token = login(client, "engineer", "eng456")
    headers = auth_header(engineer_token)
    client.post("/api/simulate", json={"failure": True}, headers=headers)

    states = set()
    for _ in range(30):
        body = client.get("/api/sensor-data", headers=headers).json()
        states.add(body["state"])
    client.post("/api/simulate", json={"failure": False}, headers=headers)

    # The ramp must reach the danger zone within 30 polls (~60 simulated s).
    assert "danger" in states


# ── Alerts ─────────────────────────────────────────────────────────────
def test_alerts_endpoint(client: TestClient):
    token = login(client)
    response = client.get("/api/alerts", params={"limit": 5}, headers=auth_header(token))
    assert response.status_code == 200
    body = response.json()
    assert "alerts" in body and "total_today" in body and "unread_count" in body
    assert len(body["alerts"]) <= 5
