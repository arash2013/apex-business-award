# Apex Business Award

**Recognizing Excellence in Local Business** — Houston, TX · 2026

A platform that identifies top-rated businesses using Google/Yelp data, notifies them of award eligibility, and sells them award packages.

## Quick Start (Docker)

```bash
cp .env.example backend/.env.development   # fill in API keys
docker compose -f docker-compose.dev.yml up --build
```

Services:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API docs: http://localhost:8000/api/docs
- Postgres: localhost:5432
- Redis: localhost:6379

Run migrations + seed data:

```bash
docker compose -f docker-compose.dev.yml exec api alembic upgrade head
```

## Structure

```
frontend/   Next.js 14 app router  →  Vercel
backend/    FastAPI + Celery        →  Railway
```

## Development

```bash
# Frontend only
cd frontend && npm install && npm run dev

# Backend only
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Tests
cd backend && pytest
```

## Git Workflow

- `main` → production (auto-deploy)
- `feature/*` → all new work, PR into `main`
- `hotfix/*` → urgent fixes, PR into `main`

## Award Tiers

| Tier    | Price | Includes |
|---------|-------|----------|
| Basic   | $197  | Digital badge + PDF certificate + directory listing |
| Pro     | $397  | Basic + full profile page + social media kit |
| Premium | $697  | Pro + physical award plaque |
