from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

BASE = {
    "schema_version": "1.0.0",
    "content_id": "content_1",
    "episode_id": "episode_1",
    "duration_ms": 10000,
    "manifest_version": 1,
    "confidence": 0.9,
    "segments": [
        {
            "id": "s1",
            "category": "violence",
            "start_ms": 1000,
            "end_ms": 2000,
            "confidence": 0.8,
            "verification_status": "unverified",
        }
    ],
}


def test_valid_manifest():
    r = client.post("/api/v1/manifests/validate", json=BASE)
    assert r.status_code == 200
    assert r.json()["valid"] is True


def test_invalid_range():
    bad = {**BASE, "segments": [{**BASE["segments"][0], "start_ms": 5000, "end_ms": 4000}]}
    r = client.post("/api/v1/manifests/validate", json=bad)
    assert r.status_code == 422
