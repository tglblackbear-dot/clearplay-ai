from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SRT = """1
00:00:01,000 --> 00:00:03,000
[gritos]

2
00:00:03,200 --> 00:00:05,000
Corra, eles estão chegando!

"""


def test_analysis_endpoint():
    response = client.post(
        "/api/v1/analysis/subtitles",
        json={
            "raw_subtitle": SRT,
            "duration_ms": 60000,
            "content_id": "content_test",
            "episode_id": "episode_test",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["cues_parsed"] == 2
    assert body["manifest"]["schema_version"] == "1.0.0"
    assert body["manifest"]["status"] == "draft"
    for segment in body["manifest"]["segments"]:
        assert segment["start_ms"] < segment["end_ms"] <= 60000
