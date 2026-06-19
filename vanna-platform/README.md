**Vanna Platform — AI Database Query Intelligence**

A self-hosted platform that lets users query databases using natural language. It includes:
- Backend API (FastAPI) providing authentication, query translation and execution, schema ingestion and management.
- Vanna AI microservice (FastAPI) handling natural-language → SQL generation, explanation and training.
- Frontend SPA (Vite + React) for user interaction.
- Worker for background jobs and exports.

**Features**
- Natural language → SQL generation using per-profile trained models.
- Schema discovery and ingestion with background training.
- Role-based authentication and API tokens.
- Audit logging and query history.
- API endpoints for external applications

**Architecture**
- `backend/` — Main FastAPI application exposing versioned API endpoints.
- `vanna-service/` — AI microservice used for SQL generation and training.
- `frontend/` — React + Vite single-page application.
- `worker/` — Background tasks and export workers.
- `database/` — DB initialization scripts for local/dev usage.
- Docker Compose orchestrates services for local/dev deployment.

**Quick Start**
Prerequisites: Docker and Docker Compose.

Start all services (development):

```bash
# from repository root
docker-compose up --build
```

Backend API will be available at `http://localhost:8000` and API docs at `http://localhost:8000/api/docs`.

**Configuration**
- Environment variables are loaded from `.env` files.

**API**
- Interactive docs: `/api/docs` (Swagger) and `/api/redoc` (ReDoc).
- Notable routes:
  - `POST /api/query` — submit a natural-language query.
  - `POST /schema/ingest/{profile_id}` — trigger schema discovery and training (runs as FastAPI BackgroundTasks).
  - `GET /api/v1/health/vanna` — checks vanna-service health.

**Development**
Backend (Python):

```bash
# create venv and install (optional)
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# run backend locally
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
pnpm install    # or npm/yarn
pnpm run dev
```

Vanna service (local):

```bash
cd vanna-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Migrations (Alembic):

```bash
cd backend
alembic upgrade head
```

**Contributing**
- Follow the existing project style.
- Run linters and tests before opening PRs.
- For significant changes, open an issue first to discuss design.

**License & Credits**
This project includes independent components and dependencies; review each `requirements.txt` for licensing details.

**Contact / Support**
For questions or issues, open an issue in the repository or contact the maintainers.

1. Utkarsh Ekka (Summer Intern 2026 at Infocom Services,ONGC)
2. V.Karthikeyan (Summer Intern 2026 at Infocom Services,ONGC)
3. Sri Abirami (Summer Intern 2026 at Infocom Services,ONGC)
