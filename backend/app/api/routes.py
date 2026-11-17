from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.database.models import Content
from app.schemas.manifest import ManifestIn

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
