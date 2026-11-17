import os
import tempfile

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.database.models import Content
from app.schemas.analysis import SubtitleAnalysisIn, SubtitleAnalysisOut
from app.schemas.manifest import ManifestIn
from app.services.manifest_generator import generate_manifest
from app.services.subtitle_analyzer import analyze_subtitles
from app.services.subtitle_parser import parse_subtitles
from app.services.video_analyzer import analyze_video
from app.vision.vlm_classifier import get_classifier

router = APIRouter(prefix="/api/v1")


@router.get("/contents/search")
def search_contents(q: str = Query(min_length=2, max_length=200), db: Session = Depends(get_db)):
    """Busca conteúdos reais no banco. Sem dados fictícios."""
    rows = db.query(Content).filter(Content.normalized_title.ilike(f"%{q.lower()}%")).limit(20).all()
    return [
        {"id": str(r.id), "title": r.title, "type": r.content_type, "year": r.release_year}
        for r in rows
    ]


@router.post("/manifests/validate")
def validate_manifest(manifest: ManifestIn):
    """Valida um mapa de cortes contra o contrato versionado. Não persiste ainda."""
    return {"valid": True, "segments": len(manifest.segments)}


@router.post("/analysis/subtitles", response_model=SubtitleAnalysisOut)
def analyze_subtitles_endpoint(payload: SubtitleAnalysisIn):
    """Analisa legendas reais e propõe um mapa em draft.

    Nenhum tempo é inventado: as janelas vêm dos timestamps dos blocos.
    """
    cues = parse_subtitles(payload.raw_subtitle)
    candidates = analyze_subtitles(cues)
    manifest = generate_manifest(
        candidates=candidates,
        duration_ms=payload.duration_ms,
        content_id=payload.content_id,
        episode_id=payload.episode_id,
        version=payload.manifest_version,
    )
    return {
        "cues_parsed": len(cues),
        "candidates": candidates,
        "manifest": manifest.model_dump(),
    }


@router.post("/analysis/video")
async def analyze_video_endpoint(
    video: UploadFile = File(...),
    content_id: str = Form(...),
    episode_id: str = Form(...),
    duration_ms: int = Form(...),
    subtitle: UploadFile | None = File(default=None),
):
    """Analisa um vídeo autorizado e devolve um mapa em draft.

    O arquivo é temporário e removido ao final. Nenhum vídeo é armazenado.
    """
    if duration_ms < 1:
        return {"error": "duration_ms inválido"}
    allowed = {"video/mp4", "video/webm", "video/quicktime", "video/x-matroska"}
    if video.content_type and video.content_type not in allowed:
        return {"error": "Formato de vídeo não suportado"}

    suffix = os.path.splitext(video.filename or "video.mp4")[1][:8] or ".mp4"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await video.read())
        video_path = tmp.name

    subtitle_text = None
    if subtitle:
        subtitle_text = (await subtitle.read()).decode("utf-8", errors="replace")

    try:
        candidates, frames, cuts = analyze_video(video_path, get_classifier(), subtitle_text)
        manifest = generate_manifest(candidates, duration_ms, content_id, episode_id)
        return {
            "frames_analyzed": frames,
            "scene_cuts": cuts,
            "candidates": candidates,
            "manifest": manifest.model_dump(),
        }
    finally:
        try:
            os.unlink(video_path)
        except OSError:
            pass
