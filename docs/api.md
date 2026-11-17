# API

Base: `/api/v1`

- `GET /health` — status do processo.
- `GET /contents/search?q=` — busca no catálogo local real.
- `POST /manifests/validate` — valida um mapa contra o contrato `1.0.0`.
- `POST /analysis/subtitles` — analisa SRT/VTT e propõe um mapa em `draft` (Fase 2).
- `GET /manifests/{episode_id}` — planejado.
- `POST /analysis/jobs` — planejado (Fase 2).
- `GET/POST/PUT/DELETE /profiles` — planejado após autenticação.

Documentação interativa: `/docs` quando o backend estiver rodando.
