# Instalação

## Pré-requisitos
- Node.js 20+
- Python 3.12+
- Docker + Docker Compose

## Local
```sh
cp .env.example .env
docker compose up -d db redis
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
uvicorn app.main:app --reload
cd ../frontend && npm install && npm run dev
```

## Extensão
```sh
cd extension && npm install && npm run build
```
Depois carregue `extension/` como extensão descompactada no Chrome/Edge.

## Banco
Aplique `supabase/migrations/001_initial_schema.sql` em um projeto Supabase próprio. Este repositório não contém credenciais.
