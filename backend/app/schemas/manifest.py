from typing import Literal

from pydantic import BaseModel, Field, model_validator

Category = Literal["nudity", "sex", "violence", "graphic_violence", "language", "drugs", "alcohol", "disturbing"]


class SegmentIn(BaseModel):
    id: str = Field(min_length=1)
    category: Category
    start_ms: int = Field(ge=0)
    end_ms: int = Field(gt=0)
    confidence: float = Field(ge=0, le=1)
    description: str | None = Field(default=None, max_length=500)
    source: str | None = None
    verification_status: Literal["unverified", "reviewed", "verified", "rejected"] = "unverified"


class ManifestIn(BaseModel):
    schema_version: Literal["1.0.0"]
    content_id: str = Field(min_length=1)
    episode_id: str = Field(min_length=1)
    duration_ms: int = Field(gt=0)
    manifest_version: int = Field(gt=0)
    confidence: float = Field(ge=0, le=1)
    source: str | None = None
    status: Literal["draft", "review", "verified", "rejected"] = "draft"
    segments: list[SegmentIn]

    @model_validator(mode="after")
    def validate_segments(self):
        ids = [s.id for s in self.segments]
        if len(ids) != len(set(ids)):
            raise ValueError("IDs de segmentos duplicados")
        for s in self.segments:
            if s.start_ms >= s.end_ms:
                raise ValueError("start_ms deve ser menor que end_ms")
            if s.end_ms > self.duration_ms:
                raise ValueError("segmento fora da duração declarada")
        return self
