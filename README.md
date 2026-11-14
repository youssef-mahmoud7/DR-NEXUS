# DR. NEXUS

DR. NEXUS is the foundation for an AI-powered astronaut health monitoring and decision-support system for long-duration space missions. This repository deliberately contains infrastructure only: it does not provide medical advice, predictions, diagnostic logic, or trained AI models.

## Architecture

```text
frontend/   React + Vite + TypeScript browser application
backend/    FastAPI service and API contracts
ai/         Isolated Python workspace for future model research
database/   Supabase PostgreSQL schema and migrations
docs/       Architecture and project documentation
```

The client will use IndexedDB for resilient local caching and offline support. Supabase provides the free-tier-compatible PostgreSQL, Authentication, and Storage foundation for persistent cloud data. The FastAPI service is the boundary for server-side integrations and privileged actions. Read [the architecture notes](docs/architecture.md) for details.

## Prerequisites

- Node.js 20.19+ or 22.12+
- Python 3.11+
- A Supabase project when cloud persistence, authentication, or storage is ready to be configured

## Setup

Clone the repository, then configure each application independently.

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. A production build can be checked with `npm run build`.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e .
copy .env.example .env
fastapi dev app/main.py
```

The API runs at `http://localhost:8000`. Verify it at `GET /api/v1/health`; interactive API documentation is at `/docs`.

For macOS/Linux activation, use `source .venv/bin/activate` instead.

### AI workspace

```bash
cd ai
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e .
```

The AI package is intentionally empty of models and data. Do not add datasets, artifacts, or clinical logic without appropriate review.

## Supabase configuration (when ready)

1. Create a free Supabase project.
2. Copy its project URL and anon key into `frontend/.env`.
3. Copy the URL, anon key, and—only for trusted server workloads—service-role key into `backend/.env`.
4. Keep service-role keys out of the browser and out of Git.
5. Add all reviewed SQL changes as migrations in `database/migrations/`, with Row Level Security enabled for user or health-related data.

## Current scope

Included: monorepo layout, a Tailwind-enabled React landing page, FastAPI health endpoints, environment templates, database migration baseline, and a future AI package structure.

Not included: authentication flows, Supabase client wiring, database tables, IndexedDB implementation, telemetry ingestion, dashboards, AI training, or health recommendations.
