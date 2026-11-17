from __future__ import annotations

import re
from dataclasses import dataclass

from app.services.subtitle_parser import Cue

Category = str

KEYWORDS: dict[Category, tuple[str, ...]] = {
    "sex": (
        r"\bgemid\w*", r"\bbeij\w*", r"\bsensual\w*", r"\bsexual\w*", r"\b intimate\b",
        r"\bmaking love\b", r"\bmoan\w*", r"\bkiss\w*",
    ),
    "nudity": (
        r"\bnu\b", r"\bnua\b", r"\btoples?s\b", r"\bdespij\w*", r"\bnaked\b", r"\btopless\b",
    ),
    "violence": (
        r"\btiro\w*", r"\bgrito\w*", r"\bbriga\b", r"\bsoco\w*", r"\bataque\b",
        r"\bgunshot\w*", r"\bscream\w*", r"\bfight\b", r"\bpunch\w*",
    ),
    "graphic_violence": (
        r"\bsangue\b", r"\bmutila\w*", r"\bcort\w*", r"\bdestroç\w*", r"\bblood\b", r"\bgore\b", r"\bmutilat\w*",
    ),
    "language": (
        r"\bmerda\b", r"\bcabo\b", r"\bfoda\b", r"\bcaralho\b", r"\bfuck\w*", r"\bshit\b", r"\bdamn\b",
    ),
    "drugs": (r"\bdroga\w*", r"\bcocaína\b", r"\bmaconha\b", r"\bdrug\w*", r"\bcocaine\b", r"\bweed\b"),
    "alcohol": (r"\bbebida\b", r"\bcerveja\b", r"\bwhisk\w*", r"\bdrink\w*", r"\bbeer\b", r"\bwine\b"),
    "disturbing": (r"\bperturbad\w*", r"\bhorrífic\w*", r"\bgrito\w*", r"\bdisturbing\b", r"\bhorrific\b"),
}

SOUND_CUES = {
    "sex": ("gemid", "beij", "sons íntim", "moan", "kiss"),
    "violence": ("tiro", "grito", "soco", "explos", "gunshot", "scream", "explosion"),
    "graphic_violence": ("sangue", "osso", "blood", "gore"),
    "disturbing": ("grito", "scream", "choro"),
}

COMPILED = {cat: [re.compile(p, re.IGNORECASE) for p in patterns] for cat, patterns in KEYWORDS.items()}
BRACKET = re.compile(r"[\[(]([^\])]{2,80})[\])]")


@dataclass(frozen=True)
class Hit:
    category: Category
    cue_index: int
    start_ms: int
    end_ms: int
    weight: float
    evidence: str


def _sound_hits(cue: Cue) -> list[Hit]:
    hits: list[Hit] = []
    for match in BRACKET.finditer(cue.text):
        phrase = match.group(1).lower()
        for category, cues in SOUND_CUES.items():
            if any(token in phrase for token in cues):
                hits.append(Hit(category, cue.index, cue.start_ms, cue.end_ms, 0.8, phrase.strip()))
    return hits


def _keyword_hits(cue: Cue) -> list[Hit]:
    hits: list[Hit] = []
    for category, patterns in COMPILED.items():
        for pattern in patterns:
            match = pattern.search(cue.text)
            if match:
                hits.append(Hit(category, cue.index, cue.start_ms, cue.end_ms, 0.4, match.group(0)))
                break
    return hits


def analyze_subtitles(cues: list[Cue], gap_ms: int = 4000, margin_ms: int = 500) -> list[dict]:
    """Agrupa sinais próximos em janelas candidatas.

    Uma palavra isolada (peso 0.4) nunca atinge o limiar de 0.6.
    """
    hits: list[Hit] = []
    for cue in cues:
        hits.extend(_sound_hits(cue))
        hits.extend(_keyword_hits(cue))

    by_category: dict[str, list[Hit]] = {}
    for hit in hits:
        by_category.setdefault(hit.category, []).append(hit)

    candidates: list[dict] = []
    for category, category_hits in by_category.items():
        ordered = sorted(category_hits, key=lambda h: (h.start_ms, h.cue_index))
        group: list[Hit] = []

        def flush() -> None:
            if not group:
                return
            weight = max(h.weight for h in group) + 0.2 * (len(group) - 1)
            score = min(1.0, round(weight, 3))
            if score >= 0.6:
                start = max(0, min(h.start_ms for h in group) - margin_ms)
                end = max(h.end_ms for h in group) + margin_ms
                evidence = sorted({h.evidence for h in group})
                candidates.append(
                    {
                        "category": category,
                        "start_ms": start,
                        "end_ms": end,
                        "confidence": score,
                        "description": "Sinais de legenda: " + ", ".join(evidence[:5]),
                        "source": "subtitle_analysis",
                        "signals": len(group),
                    }
                )

        for hit in ordered:
            if group and hit.start_ms - group[-1].end_ms > gap_ms:
                flush()
                group = []
            group.append(hit)
        flush()

    return sorted(candidates, key=lambda c: (c["start_ms"], c["category"]))
