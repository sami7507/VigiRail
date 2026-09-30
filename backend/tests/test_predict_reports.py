"""Prediction, reports and system-endpoint tests."""

from __future__ import annotations

from fastapi.testclient import TestClient

from tests.conftest import auth_header, login


# ── POST /api/predict ──────────────────────────────────────────────────
def test_predict_requires_auth(client: TestClient):
    response = client.post(
        "/api/predict", json={"vibration": 2.0, "temperature": 55,
                              "acoustic": 40, "wear": 18}
    )
    assert response.status_code == 401


def test_predict_operator_forbidden(client: TestClient):
    token = login(client, "operator", "ops789")
    response = client.post(
        "/api/predict",
        json={"vibration": 2.0, "temperature": 55, "acoustic": 40, "wear": 18},
        headers=auth_header(token),
    )
    assert response.status_code == 403


def test_predict_normal_reading(client: TestClient):
    token = login(client, "engineer", "eng456")
    response = client.post(
        "/api/predict",
        json={"vibration": 2.0, "temperature": 55, "acoustic": 40, "wear": 18},
        headers=auth_header(token),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["state"] == "good"
    assert body["failure_probability"] < 35
    assert body["health_score"] > 65
    assert set(body["component_risks"]) == {
        "wheel_bearing", "track_damage", "overheating", "brake_wear"
    }
    # Feature importances come from the fitted forest and sum ≈ 1.
    assert abs(sum(body["feature_importance"].values()) - 1.0) < 0.01


def test_predict_critical_reading(client: TestClient):
    token = login(client, "engineer", "eng456")
    response = client.post(
        "/api/predict",
        json={"vibration": 10.0, "temperature": 98, "acoustic": 92, "wear": 80},
        headers=auth_header(token),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["state"] == "danger"
    assert body["failure_probability"] >= 70


def test_predict_is_deterministic(client: TestClient):
    token = login(client, "engineer", "eng456")
    payload = {"vibration": 4.2, "temperature": 66, "acoustic": 51, "wear": 33}
    first = client.post("/api/predict", json=payload, headers=auth_header(token)).json()
    second = client.post("/api/predict", json=payload, headers=auth_header(token)).json()
    assert first == second


def test_predict_validation_bounds(client: TestClient):
    token = login(client)
    response = client.post(
        "/api/predict",
        json={"vibration": 2.0, "temperature": 55, "acoustic": 40, "wear": 150},
        headers=auth_header(token),
    )
    assert response.status_code == 422


def test_model_info_endpoint(client: TestClient):
    token = login(client, "engineer", "eng456")
    response = client.get("/api/model", headers=auth_header(token))
    assert response.status_code == 200
    body = response.json()
    assert body["ready"] is True
    assert body["test_accuracy"] > 0.8
    assert body["trees"] == 200
    assert body["features"] == ["vibration", "temperature", "acoustic", "wear"]


def test_model_info_forbidden_for_operator(client: TestClient):
    token = login(client, "operator", "ops789")
    assert client.get("/api/model", headers=auth_header(token)).status_code == 403


# ── Reports ────────────────────────────────────────────────────────────
def test_report_csv_download(client: TestClient):
    inspector_token = login(client, "inspector", "insp321")
    response = client.get(
        "/api/reports/inspection",
        params={"train": "12951", "format": "csv"},
        headers=auth_header(inspector_token),
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers["content-disposition"]
    assert "vigirail-inspection-12951-" in response.headers["content-disposition"]
    text = response.text
    assert "VigiRail Inspection Report" in text
    assert "Sensor readings" in text
    assert "Bogie status" in text
    assert "Maintenance actions" in text


def test_report_json_format(client: TestClient):
    admin_token = login(client)
    response = client.get(
        "/api/reports/inspection",
        params={"train": "12002", "format": "json"},
        headers=auth_header(admin_token),
    )
    assert response.status_code == 200
    body = response.json()
    assert body["report_id"].startswith("VR-")
    assert body["train_id"] == "12002"
    assert body["generated_by"] == "admin"
    assert len(body["bogies"]) == 6


def test_report_forbidden_for_engineer(client: TestClient):
    token = login(client, "engineer", "eng456")
    response = client.get(
        "/api/reports/inspection",
        params={"train": "12951"},
        headers=auth_header(token),
    )
    assert response.status_code == 403


def test_report_unknown_train(client: TestClient):
    token = login(client, "inspector", "insp321")
    response = client.get(
        "/api/reports/inspection",
        params={"train": "00000"},
        headers=auth_header(token),
    )
    assert response.status_code == 404


# ── System ─────────────────────────────────────────────────────────────
def test_status_is_public(client: TestClient):
    response = client.get("/api/status")
    assert response.status_code == 200
    body = response.json()
    assert body["api"] == "online"
    assert body["app"] == "VigiRail"
    assert "RandomForest" in body["ml_model"]


def test_healthz_public_and_ready(client: TestClient):
    response = client.get("/healthz")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_ready"] is True


def test_root_public(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "VigiRail"
    # Security headers present.
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert "x-request-id" in response.headers
