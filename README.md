# Apex Business Award

**Recognizing Excellence in Local Business** — National · 2026

A platform that identifies top-rated businesses using verified Google data, notifies them of award eligibility, and sells them award packages.

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
infra/      Terraform (Azure)       →  reserved for scaling
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

Tag a release with `v<major>.<minor>.<patch>` to trigger a GitHub Release automatically.

## Qualification API

Businesses are scored against the following criteria using live Google Places data:

| Signal | Requirement | Max pts |
|--------|-------------|---------|
| Google rating | ≥ 4.0 stars | 40 |
| Review count | ≥ 50 reviews | 30 |
| Review recency | at least 1 review within 12 months | 20 |
| Owner response rate | based on last 90 days | 10 |

### Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/qualify/autocomplete?q=` | Business search typeahead (Google Places) |
| `POST` | `/api/v1/qualify/by-place-id` | Score a business by Google Place ID |
| `POST` | `/api/v1/qualify` | Score a business from raw metrics (no API call) |

## Award Tiers

| Tier    | Price | Includes |
|---------|-------|----------|
| Basic   | $199  | Digital badge + PDF certificate + directory listing |
| Pro     | $249  | Basic + full profile page + social media kit |
| Premium | $349  | Pro + physical award plaque |
