# Apex Business Award — Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Starter Stack (Production)](#starter-stack-production)
3. [Local Development](#local-development)
4. [CI/CD](#cicd)
5. [Accounts & Services](#accounts--services)
6. [Environment Variables Reference](#environment-variables-reference)
7. [Scaling Path — Azure](#scaling-path--azure)
8. [Scaling Path — AWS](#scaling-path--aws)
9. [Award Tiers](#award-tiers)
10. [Data Flow](#data-flow)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │  Vercel (CDN)   │  Next.js 14 frontend
                   │  next.js 14     │  Auto-deploys from main
                   └────────┬────────┘
                            │ HTTPS /api/v1/
                   ┌────────▼────────┐
                   │    Railway      │  FastAPI + Uvicorn
                   │    API service  │  Auto-deploys from main
                   └──┬──────────┬───┘
                      │          │
           ┌──────────▼──┐  ┌────▼──────────┐
           │    Neon      │  │    Upstash     │
           │  PostgreSQL  │  │    Redis       │
           │  (serverless)│  │  (serverless)  │
           └─────────────┘  └────────────────┘
                                    │
                   ┌────────────────▼──────────┐
                   │    Railway Worker service  │  Celery worker
                   │    Railway Beat service    │  Celery beat scheduler
                   └──────────────┬────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼──────┐  ┌─────────▼──────┐  ┌────────▼───────┐
    │ Google Places  │  │   Yelp Fusion  │  │    SendGrid    │
    │     API        │  │      API       │  │    (email)     │
    └────────────────┘  └────────────────┘  └────────────────┘
```

---

## Starter Stack (Production)

### Services & Cost

| Service | Provider | Plan | Est. Cost |
|---------|----------|------|-----------|
| Frontend | Vercel | Hobby (free) | $0 |
| Backend API | Railway | Starter $5 credit | ~$5–10/mo |
| Celery Worker | Railway | (same project) | included |
| Celery Beat | Railway | (same project) | included |
| Database | Neon | Free (0.5 GB) | $0–19/mo |
| Cache / Queue | Upstash Redis | Free (10K cmd/day) | $0 |
| Email | SendGrid | Free (100/day) | $0 |
| Payments | Stripe | — | 2.9% + $0.30/txn |
| Business data | Google Places API | Pay-per-use | ~$17/1K req |
| Reviews X-ref | Yelp Fusion | Free tier | $0 |
| CI/CD | GitHub Actions | Free | $0 |
| **Total** | | | **~$5–30/mo** |

### Backend Railway Services

Three Railway services share the same Docker image from the `backend/` directory:

| Service | Start Command |
|---------|--------------|
| `api` | `uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| `worker` | `celery -A workers.celery_app worker --loglevel=info` |
| `beat` | `celery -A workers.celery_app beat --loglevel=info` |

All three services share the same environment variables set in the Railway project.

---

## Local Development

### Prerequisites
- Docker Desktop
- (optional) Node.js 20+ and Python 3.11+ for running outside Docker

### Start Everything

```bash
cp .env.example backend/.env.development
cp .env.example frontend/.env.development
# Fill in API keys in backend/.env.development

docker compose -f docker-compose.dev.yml up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Flower (worker monitor) | http://localhost:5555 |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

### Run Migrations

```bash
docker compose -f docker-compose.dev.yml exec api alembic upgrade head
```

---

## CI/CD

### GitHub Actions (`.github/workflows/`)

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | PR to main, push to feature/* | Lint, type check, tests |

### Deployment (no workflow needed)

- **Vercel** — connect GitHub repo in dashboard → auto-deploys `frontend/` on push to `main`
- **Railway** — connect GitHub repo in dashboard → auto-deploys `backend/` on push to `main`

Both platforms build and deploy automatically. GitHub Actions only handles CI (tests/lint).

### Branch Strategy

```
main          ← production (Vercel + Railway auto-deploy)
feature/*     ← all development work, PR into main
hotfix/*      ← urgent fixes, PR into main
```

---

## Accounts & Services

### Required Accounts

| Service | URL | What for | Credentials location |
|---------|-----|----------|---------------------|
| Vercel | vercel.com | Frontend hosting | Vercel dashboard |
| Railway | railway.app | Backend hosting | Railway dashboard |
| Neon | neon.tech | PostgreSQL | Neon dashboard |
| Upstash | upstash.com | Redis | Upstash dashboard |
| SendGrid | sendgrid.com | Transactional email | SendGrid dashboard |
| Stripe | stripe.com | Payments | Stripe dashboard |
| Google Cloud | console.cloud.google.com | Places API key | GCP console → Credentials |
| Yelp | yelp.com/developers | Fusion API key | Yelp developer dashboard |
| GitHub | github.com | Source control + CI | GitHub settings |
| SerpAPI _(scale)_ | serpapi.com | Google search scraping | SerpAPI dashboard |
| BrightData _(scale)_ | brightdata.com | Residential proxies for Yelp at scale | BrightData dashboard |

### GitHub Secrets (for CI)

Set these in **GitHub → Settings → Secrets → Actions**:

| Secret | Value |
|--------|-------|
| _(none required for CI currently)_ | CI runs tests with local postgres/redis services |

### Vercel Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Railway API service URL |
| `NEXT_PUBLIC_BRAND_NAME` | `Apex Business Award` |
| `NEXT_PUBLIC_BRAND_SHORT` | `Apex` |
| `NEXT_PUBLIC_BRAND_TAGLINE` | `Recognizing Excellence in Local Business` |
| `NEXT_PUBLIC_BRAND_CITY` | `Houston` |
| `NEXT_PUBLIC_BRAND_YEAR` | `2026` |
| `NEXT_PUBLIC_BRAND_COLOR_PRIMARY` | `#1B2B4B` |
| `NEXT_PUBLIC_BRAND_COLOR_ACCENT` | `#C9A84C` |
| `NEXTAUTH_URL` | Your Vercel production URL |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `JWT_SECRET` | Must match backend `SECRET_KEY` |

### Railway Environment Variables

Set these in **Railway → Project → Variables** (shared across all services):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string (`postgresql+asyncpg://...`) |
| `REDIS_URL` | Upstash Redis URL (`rediss://...`) |
| `ENVIRONMENT` | `production` |
| `SECRET_KEY` | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `GOOGLE_PLACES_API_KEY` | Google Cloud → Credentials |
| `YELP_API_KEY` | Yelp Developer dashboard |
| `SENDGRID_API_KEY` | SendGrid dashboard |
| `SENDGRID_FROM_EMAIL` | `awards@apexbusinessaward.com` |
| `SENDGRID_FROM_NAME` | `Apex Business Award` |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Webhooks |
| `STRIPE_BASIC_PRICE_ID` | Stripe dashboard → Products |
| `STRIPE_PRO_PRICE_ID` | Stripe dashboard → Products |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe dashboard → Products |
| `ADMIN_API_KEY` | `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `BRAND_NAME` | `Apex Business Award` |
| `BRAND_SHORT` | `Apex` |
| `BRAND_YEAR` | `2026` |
| `SERPAPI_KEY` | _(blank until needed at scale)_ |
| `BRIGHTDATA_PROXY_URL` | _(blank until needed at scale)_ |

---

## Environment Variables Reference

Full list of all variables. See `.env.example` for local dev values.

### Backend (`backend/.env.development`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql+asyncpg://...`) |
| `REDIS_URL` | Yes | Redis connection string (`redis://...` or `rediss://...`) |
| `ENVIRONMENT` | Yes | `development`, `test`, or `production` |
| `SECRET_KEY` | Yes (prod) | JWT signing key — generate with `secrets.token_hex(32)` |
| `GOOGLE_PLACES_API_KEY` | Yes | Google Cloud Places API — needed for crawl jobs |
| `YELP_API_KEY` | No | Yelp Fusion API — adds cross-reference bonus to score |
| `SENDGRID_API_KEY` | Yes (prod) | Transactional email |
| `SENDGRID_FROM_EMAIL` | Yes | Sender address |
| `SENDGRID_FROM_NAME` | Yes | Sender display name |
| `STRIPE_SECRET_KEY` | Yes (prod) | Stripe secret key (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes (prod) | Stripe webhook signing secret |
| `STRIPE_BASIC_PRICE_ID` | Yes (prod) | Stripe Price ID for $199 Basic tier |
| `STRIPE_PRO_PRICE_ID` | Yes (prod) | Stripe Price ID for $249 Pro tier |
| `STRIPE_PREMIUM_PRICE_ID` | Yes (prod) | Stripe Price ID for $349 Premium tier |
| `ADMIN_API_KEY` | No | API key for internal service-to-service calls |

### Frontend (`frontend/.env.development`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `NEXTAUTH_URL` | Yes | Full URL of this Next.js app |
| `NEXTAUTH_SECRET` | Yes | NextAuth signing secret |
| `JWT_SECRET` | Yes | Shared JWT signing secret — must match backend `SECRET_KEY` |

---

## Scaling Path — Azure

The full Terraform config is preserved in `infra/azure/` for when you're ready to migrate.

### When to Consider Scaling

- Monthly active users > 10,000
- Database > 1 GB (Neon free tier limit)
- Redis commands > 10K/day (Upstash free tier limit)
- Celery job queue latency becomes a problem
- Need SLAs, VNets, or compliance requirements

### Migration Steps

1. **Provision Azure resources**
   ```bash
   cd infra/azure
   terraform init
   terraform apply -var="db_admin_password=<secret>"
   ```
   Resources created: Container Apps (API + worker), PostgreSQL Flexible Server,
   Azure Cache for Redis, Container Registry, Static Web App, Key Vault, Storage.

2. **Migrate database** — `pg_dump` from Neon → `pg_restore` into Azure PostgreSQL

3. **Update environment variables** — swap `DATABASE_URL`, `REDIS_URL` to Azure connection strings

4. **Update CI/CD** — restore `deploy-azure.yml` from git history or use the template below:
   ```yaml
   # Template: az acr build + az containerapp update + Azure/static-web-apps-deploy@v1
   # See git log for the original deploy-azure.yml
   ```

5. **Point DNS** — update CNAME from Vercel to Azure Static Web App URL

### Azure Resource Names (from original deployment)

| Resource | Name |
|----------|------|
| Resource group | `apex-prod-rg` |
| Container Registry | `apexprodacr` |
| API Container App | `apex-prod-api` |
| Worker Container App | `apex-prod-worker` |
| Static Web App | `apex-prod-swa` |
| Key Vault | _(see `infra/azure/modules/key_vault/main.tf`)_ |
| Subscription ID | `<your-azure-subscription-id>` |
| Tenant ID | `<your-azure-tenant-id>` |

---

## Scaling Path — AWS

Alternative to Azure for teams with AWS preference.

| Azure Service | AWS Equivalent |
|--------------|----------------|
| Container Apps | ECS Fargate |
| PostgreSQL Flexible Server | RDS PostgreSQL |
| Cache for Redis | ElastiCache |
| Container Registry | ECR |
| Static Web Apps | CloudFront + S3 |
| Key Vault | Secrets Manager |
| Storage Account | S3 |
| Log Analytics | CloudWatch |

The application code requires zero changes — only the infrastructure and environment
variables differ. A Terraform config for AWS would mirror `infra/azure/` using the
`hashicorp/aws` provider.

---

## Data Flow

### Nightly Crawl Pipeline

```
Celery Beat (scheduler)
  └─ schedule_nightly_crawls task
       └─ for each Area × Category:
            └─ run_crawl_job task
                 └─ Google Places Text Search (20 results/page)
                      └─ Google Places Details (last review date)
                      └─ Yelp Business Search (cross-reference)
                      └─ compute_qualification() → score 0–100
                      └─ upsert Business record in Postgres
```

### Purchase Flow

```
User selects tier on pricing page (Next.js)
  └─ POST /api/v1/orders (FastAPI)
       └─ Lookup business + award record
       └─ Create Customer record if not exists
       └─ Create Order record (status: pending)
       └─ Create Stripe PaymentIntent
       └─ Return client_secret to frontend
  └─ Stripe Elements (frontend) → charge card
  └─ Stripe webhook → POST /api/v1/webhooks/stripe
       └─ Verify webhook signature
       └─ Mark Order status: paid
       └─ Mark Award status: purchased
       └─ Create AwardFulfillment records per deliverable
       └─ generate_assets task → PDF certificate + badge + social kit
       └─ send_confirmation_email task → SendGrid
       └─ If Premium: create plaque_order → fulfillment queue
```

### Outreach Flow

```
Celery Beat (nightly, after crawl completes)
  └─ find_newly_qualified_businesses task
       └─ For each qualified business with no prior outreach:
            └─ Create Award record (status: offered)
            └─ Create Outreach record (sequence_step: 1)
            └─ Render email template with personalization fields
            └─ Send via SendGrid
            └─ Schedule step 2: countdown = 4 days
            └─ Schedule step 3: countdown = 10 days
```

---

## Award Tiers

| Tier | Price | Includes |
|------|-------|---------|
| Basic | $199 | Digital badge, PDF certificate, Basic directory listing |
| Pro | $249 | Everything in Basic + Full profile page + Social media kit |
| Premium | $349 | Everything in Pro + Physical plaque (mailed) |
