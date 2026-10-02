import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, seed_data, get_db

@pytest.fixture(autouse=True)
def setup_database():
    import os, sqlite3
    db_path = "app/qyada_erp.db"
    if os.path.exists(db_path):
        os.remove(db_path)
    init_db()
    seed_data()

def test_health_check():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_auth_login():
    client = TestClient(app)
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CEO"

def test_executive_dashboard():
    client = TestClient(app)
    response = client.get("/api/departments/executive/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["total_revenue_aed"] > 0
    assert len(data["projects"]) >= 4

def test_projects_api():
    client = TestClient(app)
    response = client.get("/api/departments/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) >= 4
    assert projects[0]["code"].startswith("PRJ")

def test_boq_api():
    client = TestClient(app)
    response = client.get("/api/departments/boq/1")
    assert response.status_code == 200
    boqs = response.json()
    assert len(boqs) >= 1

def test_factories_overview():
    client = TestClient(app)
    response = client.get("/api/departments/factories/overview")
    assert response.status_code == 200
    data = response.json()
    assert "lines" in data
    assert "batches" in data
    assert len(data["lines"]) >= 4

def test_fleet_and_hr():
    client = TestClient(app)
    fleet_res = client.get("/api/departments/fleet")
    assert fleet_res.status_code == 200
    assert len(fleet_res.json()) >= 4

    hr_res = client.get("/api/departments/hr")
    assert hr_res.status_code == 200
    assert len(hr_res.json()) >= 4

def test_workflow_approval():
    client = TestClient(app)
    dashboard = client.get("/api/departments/executive/dashboard").json()
    pending_wf = dashboard["pending_workflows"]
    assert len(pending_wf) > 0

    wf_id = pending_wf[0]["id"]
    action_res = client.post(f"/api/departments/workflows/{wf_id}/action", json={"action": "Approve", "comments": "Approved in test"})
    assert action_res.status_code == 200
    assert action_res.json()["status"] == "Approved"

def test_ai_insights_and_chat():
    client = TestClient(app)
    insights = client.get("/api/ai/insights")
    assert insights.status_code == 200
    assert insights.json()["ai_health_score"] > 90

    chat_res = client.post("/api/ai/chat", json={"query": "ما هي مخاطر المشاريع؟"})
    assert chat_res.status_code == 200
    assert "response_ar" in chat_res.json()
