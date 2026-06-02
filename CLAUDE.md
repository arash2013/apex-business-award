# Apex Business Award — Project Memory

## Brand Config
- Name: Apex Business Award (always import from brand.ts / settings.py)
- Tagline: Recognizing Excellence in Local Business
- Launch city: Houston, TX | Year: 2026
- Colors: Navy #1B2B4B, Gold #C9A84C, Background #FAFAF8

## Repo Layout
- `frontend/` — Next.js 14 app router (Azure Static Web Apps)
- `backend/` — FastAPI Python 3.11+ (Azure Container Apps)
- `terraform/` — single-environment Azure infra (prod only)
- `scripts/bootstrap-azure.sh` — one-time OIDC + role setup
- `docker-compose.dev.yml` — local: postgres + redis + api + frontend

## Git Rules
- `main` → prod (single-branch workflow)
- All work on `feature/*`, PR into `main`
- Never push directly to main

## Coding Conventions
- Python: Black, type hints, Pydantic v2
- TypeScript: strict mode, no `any`
- API routes: /api/v1/ prefix
- Brand strings: imported from brand.ts or settings.py only
- DB operations: always through service layer, never in routes
- Secrets: env vars only
- Commits: conventional format (feat:, fix:, chore:, docs:)

## Qualification Score Formula (0-100)
- Google rating → 0-35 pts
- Review count (50+) → up to 25 pts
- Recency (3mo=20, 6mo=15, 12mo=10) pts
- Owner response rate → up to 10 pts
- Yelp cross-reference bonus → up to 10 pts
- Hard cutoffs: rating ≥ 4.0, count ≥ 50, review within 12 months

## Award Tiers
- Basic $199 | Pro $249 | Premium $349
