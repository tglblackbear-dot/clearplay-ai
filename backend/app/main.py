from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.config import settings

app = FastAPI(
    title="ClearPlay AI API",
    version="0.1.0",
    description="API de análise audiovisual e mapas de cortes. Fase 1 — fundação.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "env": settings.app_env}
