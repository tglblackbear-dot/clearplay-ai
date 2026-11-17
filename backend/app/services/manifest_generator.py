from __future__ import annotations

from app.schemas.manifest import ManifestIn


def generate_manifest(
    candidates: list[dict],
    duration_ms: int,
    content_id: str,
    episode_id: str,
    version: int = 1,
) -> ManifestIn:
    """Constrói um mapa versionado a partir de janelas candidatas.

    - remove sobreposições mantendo o intervalo mais amplo;
    - limita ao intervalo declarado;
    - nunca altera a confiança calculada.
    """
    cleaned: list[dict] = []
    for candidate in sorted(candidates, key=lambda c: c["start_ms"]):
        start = max(0, int(candidate["start_ms"]))
        end = min(duration_ms, int(candidate["end_ms"]))
        if end <= start:
            continue
        if cleaned and start <= cleaned[-1]["end_ms"]:
            cleaned[-1]["end_ms"] = max(cleaned[-1]["end_ms"], end)
            cleaned[-1]["confidence"] = max(cleaned[-1]["confidence"], candidate["confidence"])
            continue
        cleaned.append({**candidate, "start_ms": start, "end_ms": end})

    segments = []
    for index, item in enumerate(cleaned, start=1):
        segments.append(
            {
                "id": f"seg_{index:03d}",
                "category": item["category"],
                "start_ms": item["start_ms"],
                "end_ms": item["end_ms"],
                "confidence": item["confidence"],
                "description": item.get("description"),
                "source": item.get("source", "subtitle_analysis"),
                "verification_status": "unverified",
            }
        )

    confidence = round(sum(s["confidence"] for s in segments) / len(segments), 3) if segments else 0.0
    payload = {
        "schema_version": "1.0.0",
        "content_id": content_id,
        "episode_id": episode_id,
        "duration_ms": duration_ms,
        "manifest_version": version,
        "confidence": confidence,
        "source": "subtitle_analysis",
        "status": "draft",
        "segments": segments,
    }
    return ManifestIn.model_validate(payload)
