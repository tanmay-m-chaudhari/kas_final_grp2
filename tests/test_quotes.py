import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token():
    client.post("/api/auth/register", json={"username": "tester", "password": "securepassword"})
    res = client.post("/api/auth/login", json={"username": "tester", "password": "securepassword"})
    return res.json()["access_token"]

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_create_and_get_quote():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"text": "The only way to do great work is to love what you do.", "author": "Steve Jobs", "category": "motivation"}
    res = client.post("/api/quotes/", json=payload, headers=headers)
    assert res.status_code == 201
    qid = res.json()["id"]
    res2 = client.get(f"/api/quotes/{qid}")
    assert res2.status_code == 200
    assert res2.json()["author"] == "Steve Jobs"

def test_list_quotes_public():
    res = client.get("/api/quotes/")
    assert res.status_code == 200
    assert "items" in res.json()
