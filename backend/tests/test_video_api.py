from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_video_analysis_endpoint(monkeypatch):
    candidate = {
        "category": "violence",
        "start_ms": 1000,
        "end_ms": 3000,
        "confidence": 0.8,
        "description": "teste",
        "source": "subtitle+vision",
    }
    monkeypatch.setattr("app.api.routes.analyze_video", lambda *args, **kwargs: ([candidate], 1, 2))

    response = client.post(
        "/api/v1/analysis/video",
        files={"video": ("cena.mp4", b"conteudo-de-teste", "video/mp4")},
        data={"content_id": "content_test", "episode_id": "episode_test", "duration_ms": "60000"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["frames_analyzed"] == 1
    assert body["scene_cuts"] == 2
    assert body["manifest"]["segments"][0]["end_ms"] == 3000
