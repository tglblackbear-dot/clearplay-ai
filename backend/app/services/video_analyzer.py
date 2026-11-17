from __future__ import annotations

from pathlib import Path

from app.services.subtitle_analyzer import analyze_subtitles
from app.services.subtitle_parser import Cue, parse_subtitles
from app.vision.frame_extractor import extract_frame, frame_to_data_url
from app.vision.scene_detector import detect_scene_cuts
from app.vision.vlm_classifier import VisionClassifier


def refine_boundaries(start_ms: int, end_ms: int, cuts: list[int], margin_ms: int = 250) -> tuple[int, int]:
    """Ajusta limites para cortes de cena próximos, evitando cortar diálogos."""
    inside = [cut for cut in cuts if start_ms - 1000 <= cut <= end_ms + 1000]
    if not inside:
        return start_ms, end_ms
    new_start = max(start_ms, min(inside) - margin_ms)
    new_end = min(end_ms, max(inside) + margin_ms)
    return (new_start, new_end) if new_end > new_start else (start_ms, end_ms)


def analyze_video(
    video_path: str | Path,
    classifier: VisionClassifier,
    subtitle_text: str | None = None,
) -> tuple[list[dict], int, int]:
    """Combina legendas, quadros autorizados e cortes de cena.

    Retorna (candidatos, quadros_analisados, cortes_detectados).
    """
    cues: list[Cue] = parse_subtitles(subtitle_text) if subtitle_text else []
    candidates = analyze_subtitles(cues) if cues else []
    cuts = detect_scene_cuts(video_path)
    frames_analyzed = 0

    if candidates:
        for candidate in candidates:
            midpoint = (candidate["start_ms"] + candidate["end_ms"]) // 2
            frame = extract_frame(video_path, midpoint)
            if frame is None:
                continue
            verdicts = classifier.classify([frame_to_data_url(frame)])
            frames_analyzed += 1
            matching = [v for v in verdicts if v.category == candidate["category"]]
            if matching:
                candidate["confidence"] = round(max(candidate["confidence"], max(v.confidence for v in matching)), 3)
            candidate["scene_cuts"] = len([c for c in cuts if candidate["start_ms"] <= c <= candidate["end_ms"]])
            start, end = refine_boundaries(candidate["start_ms"], candidate["end_ms"], cuts)
            candidate["start_ms"], candidate["end_ms"] = start, end
            candidate["source"] = "subtitle+vision"

    return candidates, frames_analyzed, len(cuts)
