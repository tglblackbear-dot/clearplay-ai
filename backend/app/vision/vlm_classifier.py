from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Protocol

from app.config import settings

CATEGORIES = ["nudity", "sex", "violence", "graphic_violence", "language", "drugs", "alcohol", "disturbing"]


@dataclass(frozen=True)
class FrameVerdict:
    category: str
    confidence: float
    reason: str


class VisionClassifier(Protocol):
    def classify(self, frames: list[str]) -> list[FrameVerdict]:
        ...


class UnavailableClassifier:
    def classify(self, frames: list[str]) -> list[FrameVerdict]:
        return []


class GeminiVisionClassifier:
    """Classificador multimodal via endpoint OpenAI-compatible.

    Nunca retorna categories inventadas se o provedor não responder.
    """

    def __init__(self, api_url: str, api_key: str, model: str):
        self.api_url = api_url
        self.api_key = api_key
        self.model = model

    def classify(self, frames: list[str]) -> list[FrameVerdict]:
        import urllib.request

        prompt = (
            "Analise cada imagem quanto a estas categorias: " + ", ".join(CATEGORIES) + ". "
            "Responda somente JSON valido no formato "
            '{"results":[{"frame":0,"category":"violence","confidence":0.91,"reason":"curto"}]}. '
            "Use apenas categorias da lista. Se nada for detectado, retorne results vazio. "
            "Nao identifique pessoas e nao descreva conteúdo sexual explicito."
        )
        content = [{"type": "text", "text": prompt}]
        content.extend({"type": "image_url", "image_url": {"url": url, "detail": "low"}} for url in frames)
        payload = json.dumps({"model": self.model, "messages": [{"role": "user", "content": content}], "temperature": 0}).encode("utf-8")
        request = urllib.request.Request(
            self.api_url,
            data=payload,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                body = json.loads(response.read().decode("utf-8"))
        except Exception:
            return []

        raw = body.get("choices", [{}])[0].get("message", {}).get("content")
        if not isinstance(raw, str):
            return []
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            return []

        verdicts: list[FrameVerdict] = []
        for item in parsed.get("results", []):
            category = item.get("category")
            confidence = item.get("confidence")
            if category not in CATEGORIES or not isinstance(confidence, (int, float)):
                continue
            verdicts.append(FrameVerdict(category, max(0.0, min(1.0, float(confidence))), str(item.get("reason", ""))[:200]))
        return verdicts


def get_classifier() -> VisionClassifier:
    api_key = settings.ai_api_key or os.getenv("AI_API_KEY")
    api_url = settings.ai_api_url or os.getenv("AI_API_URL")
    model = settings.ai_model or os.getenv("AI_MODEL")
    if not (api_key and api_url and model):
        return UnavailableClassifier()
    return GeminiVisionClassifier(api_url, api_key, model)
