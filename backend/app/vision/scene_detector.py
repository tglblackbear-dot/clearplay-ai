from __future__ import annotations

from pathlib import Path


def detect_scene_cuts(video_path: str | Path, sample_step: int = 6, threshold: float = 32.0) -> list[int]:
    """Detecta cortes por diferença média entre quadres amostrados.

    Retorna timestamps em milissegundos. Dependências ausentes retornam lista vazia.
    """
    try:
        import cv2  # type: ignore
        import numpy as np  # type: ignore
    except ImportError:
        return []

    capture = cv2.VideoCapture(str(video_path))
    if not capture.isOpened():
        return []

    fps = capture.get(cv2.CAP_PROP_FPS) or 24.0
    cuts: list[int] = []
    previous: "np.ndarray | None" = None
    frame_index = 0

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            if frame_index % max(1, sample_step) == 0:
                small = cv2.resize(frame, (160, 90))
                gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
                if previous is not None:
                    diff = float(np.mean(np.abs(gray.astype("int16") - previous.astype("int16"))))
                    if diff >= threshold:
                        cuts.append(int((frame_index / fps) * 1000))
                previous = gray
            frame_index += 1
    finally:
        capture.release()

    return cuts
