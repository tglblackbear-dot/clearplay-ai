from __future__ import annotations

import re
from dataclasses import dataclass

TIME_PATTERN = re.compile(
    r"(?:(?P<h>\d{1,2}):)?(?P<m>\d{1,2}):(?P<s>\d{2})[.,](?P<ms>\d{1,3})\s*-->\s*"
    r"(?:(?P<h2>\d{1,2}):)?(?P<m2>\d{1,2}):(?P<s2>\d{2})[.,](?P<ms2>\d{1,3})"
)


@dataclass(frozen=True)
class Cue:
    index: int
    start_ms: int
    end_ms: int
    text: str


def _to_ms(hours: str | None, minutes: str, seconds: str, millis: str) -> int:
    ms = int(millis.ljust(3, "0")[:3])
    return ((int(hours or 0) * 3600) + (int(minutes) * 60) + int(seconds)) * 1000 + ms


def parse_timestamp(value: str) -> int:
    """Converte HH:MM:SS,mmm, MM:SS.mmm ou SS.mmm para milissegundos."""
    parts = [p.strip() for p in value.replace(",", ".").split(":")]
    if not parts:
        raise ValueError("Timestamp vazio")
    seconds_part = parts[-1]
    if "." in seconds_part:
        seconds, millis = seconds_part.split(".", 1)
    else:
        seconds, millis = seconds_part, "0"
    minutes = parts[-2] if len(parts) >= 2 else "0"
    hours = parts[-3] if len(parts) >= 3 else "0"
    return _to_ms(hours, minutes, seconds, millis)


def parse_subtitles(raw: str) -> list[Cue]:
    """Lê SRT ou WebVTT e devolve blocos com timestamps reais.

    Não inventa timestamps: blocos sem tempo válido são ignorados.
    """
    normalized = raw.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not normalized:
        return []

    cues: list[Cue] = []
    for block in re.split(r"\n{2,}", normalized):
        lines = [line for line in block.split("\n") if line.strip()]
        if not lines:
            continue
        first = lines[0].strip().upper()
        if first.startswith(("WEBVTT", "NOTE", "STYLE", "REGION")):
            continue

        time_index = next((i for i, line in enumerate(lines[:4]) if TIME_PATTERN.search(line)), None)
        if time_index is None:
            continue
        match = TIME_PATTERN.search(lines[time_index])
        if not match:
            continue

        start_ms = _to_ms(match.group("h"), match.group("m"), match.group("s"), match.group("ms"))
        end_ms = _to_ms(match.group("h2"), match.group("m2"), match.group("s2"), match.group("ms2"))
        if end_ms <= start_ms:
            continue

        text = "\n".join(lines[time_index + 1 :]).strip()
        cues.append(Cue(index=len(cues) + 1, start_ms=start_ms, end_ms=end_ms, text=text))

    return cues
