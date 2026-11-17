from pydantic import BaseModel, Field


class SubtitleAnalysisIn(BaseModel):
    raw_subtitle: str = Field(min_length=1, max_length=5_000_000)
    duration_ms: int = Field(gt=0)
    content_id: str = Field(min_length=1)
    episode_id: str = Field(min_length=1)
    manifest_version: int = Field(default=1, gt=0)


class SubtitleAnalysisOut(BaseModel):
    cues_parsed: int
    candidates: list[dict]
    manifest: dict
