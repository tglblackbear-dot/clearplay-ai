# Arquitetura

ClearPlay AI é modular e separa quatro planos:

1. **Frontend (React/Vite)** — interface SaaS, perfis, histórico, status.
2. **Extensão (MV3)** — detecção de player, estado real, comunicação por mensagens.
3. **Backend (FastAPI)** — API versionada, validação de mapas, workers assíncronos.
4. **Dados (Supabase/Postgres + Redis)** — RLS, mapas versionados e cache.

Contratos ficam em `shared/` e são a fonte da verdade para o formato de mapas JSON.

A extensão nunca altera o conteúdo original. Ela only atua sobre players compatíveis e recebe mapas validados. Serviços protegidos por DRM não são suportados.

A análise pesada acontece fora do navegador, em workers, e nunca bloqueia a reprodução.
