from __future__ import annotations

import base64
import subprocess
from pathlib import Path

import imageio_ffmpeg


def ffmpeg_binary() -> str:
    return imageio_ffmpeg.get_ffmpeg_exe()


def extract_frame(video_path: str | Path, timestamp_ms: int) -> bytes | None:
    """Extrai um quadro JPEG em timestamp_ms. Nunca grava arquivos sensíveis em disco."""
    seconds = max(0, timestamp_ms) / 1000
    command = [
        ffmpeg_binary(),
        "-loglevel", "error",
        "-ss", f"{seconds:.3f}",
        "-i", str(video_path),
        "-frames:v", "1",
        "-f", "image2pipe",
        "-vcodec", "mjpeg",
        "-",
    ]
    try:
        result = subprocess.run(command, capture_output=True, timeout=30, check=False)
    except (OSError, subprocess.TimeoutExpired):
        return None
    return result.stdout or None


def frame_to_data_url(frame: bytes) -> str:
    return "data:image/jpeg;base64," + base64.b64encode(frame).decode("ascii")
