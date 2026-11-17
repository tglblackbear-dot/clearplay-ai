# CLEARPLAY AI

**Assista ao que você ama. Do seu jeito.**

Plataforma inteligente de análise audiovisual, filtragem de cenas e reprodução personalizada.

## Status

**Fase 2/3 entregues.** Leitura SRT/VTT, análise contextual, geração de mapas, extração de quadros, detecção de cortes, classificação multimodal opcional (Gemini), controlador de saltos da extensão e efeitos de transição. Ainda dependem de hospedagem/credenciais: backend público, Supabase Auth e catálogo externo (TMDb/IMDb).

## Princípios

- O usuário tem controle absoluto do que deseja filtrar.
- O sistema **não** altera conteúdo original, não baixa vídeos ilegalmente, não remove DRM e não intercepta fluxos protegidos.
- Filtragem usa metadados, legendas, mapas temporais e análise somente com autorização técnica e jurídica.
- Nenhum dado fictício é apresentado como real.
- Nenhum botão sem ação funcional é entregue.

## Estrutura

```
frontend/    React + TypeScript + Vite + Tailwind (SaaS premium)
extension/   Chrome/Edge Manifest V3
backend/     FastAPI + Pydantic + SQLAlchemy + workers assíncronos
shared/      Schemas e contratos versionados
supabase/    Migrations, RLS e Edge Functions
infrastructure/ Docker, deploy, monitoramento
docs/        Arquitetura, instalação, API, segurança, guia do usuário
```

## Executar (Fase 1)

```sh
cp .env.example .env
docker compose up -d
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

Frontend: `http://localhost:5173` · API: `http://localhost:8000/docs`

## Documentação

- `docs/architecture.md`
- `docs/installation.md`
- `docs/api.md`
- `docs/security.md`
- `docs/user-guide.md`

## Limitações atuais

- Não há integração com serviços de streaming protegidos por DRM.
- Não há análise de visão computacional implementada nesta fase.
- A extensão ainda não executa saltos; apenas detecta players compatíveis e expõe estado real.
- Nenhum mapa de cortes é distribuído nesta fase.
