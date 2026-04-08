# Phase 6 — DevOps & Deployment

**Goal:** Full stack containerized, CI/CD pipeline running, deployed to production.
**Depends on:** Phase 1–5 (stable, tested codebase)
**Blocks:** Phase 7

---

## Context

Currently only the PostgreSQL container runs via Docker Compose. The API and dashboard must be started manually. There is no CI/CD, no reverse proxy, and no production deployment. This phase automates everything.

**Target architecture:**
```
Internet
  └── Nginx (reverse proxy, TLS termination)
        ├── /         → admin-dashboard (Next.js, port 3000)
        ├── /api      → api (Express, port 5000)
        └── /bot      → (webhook endpoint, port 3001)
PostgreSQL container (internal network only)
```

---

## Tasks

### 6.1 — Complete Docker Compose
**File:** `docker/docker-compose.yml`

- Uncomment and complete the `api` and `admin-dashboard` service definitions
- Add `telegram-bot` service
- Add `nginx` service using official `nginx:alpine` image
- Use multi-stage Dockerfiles (existing `api.Dockerfile` and `admin.Dockerfile` — review and update)
- Create `docker/telegram-bot.Dockerfile`
- Create `docker/nginx.conf` with reverse proxy config
- All services on an internal Docker network; only Nginx exposed externally
- Use `depends_on` with health checks: API and dashboard wait for PostgreSQL to be healthy
- Mount volumes for PostgreSQL data persistence

**Environment variables:**
- Each service reads from `.env` file (Docker Compose `env_file`)
- No hardcoded secrets in `docker-compose.yml`

---

### 6.2 — Environment variable management
**Files:** `.env.example` (create/update), `.env.production.example` (create)

Create comprehensive `.env.example` with all required vars:
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/test_system

# API
JWT_SECRET=change-me-in-production
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000

# Admin Dashboard
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET=change-me-in-production

# Telegram Bot
BOT_TOKEN=your-telegram-bot-token
API_URL=http://api:5000

# Nginx (production)
DOMAIN=yourdomain.com
```

- Ensure `.env` is in `.gitignore` (verify)
- Document each variable in `.env.example` with comments

---

### 6.3 — Database migration strategy
**Files:** `docker/docker-compose.yml`, `apps/api/src/scripts/migrate.ts` or migration entrypoint

- Add a one-off migration service or entrypoint script that runs `prisma migrate deploy` before the API starts
- Use Docker `command` override or an entrypoint shell script: `sh -c "npx prisma migrate deploy && node dist/server.js"`
- Ensure migrations are idempotent and safe to run on container restart
- Document rollback procedure in `DEV_SETUP.md`

---

### 6.4 — Nginx configuration
**File:** `docker/nginx.conf`

- Reverse proxy: route `/api/` to Express, `/` to Next.js
- Telegram webhook endpoint: route `/webhook` to bot service
- Enable gzip compression
- Set security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
- TLS: use Certbot/Let's Encrypt via a companion container (or document manual cert setup)
- Rate limiting at Nginx level as additional defense

---

### 6.5 — CI/CD pipeline (GitHub Actions)
**Files:** `.github/workflows/ci.yml` (create), `.github/workflows/deploy.yml` (create)

**CI workflow** (runs on every push and PR):
```yaml
jobs:
  lint:     # turbo run lint
  build:    # turbo run build
  test:     # spin up postgres:15, run migrations, vitest run
  e2e:      # playwright tests against built app
```

**Deploy workflow** (runs on push to `main` after CI passes):
```yaml
jobs:
  deploy:
    - SSH to production server
    - Pull latest code
    - docker compose pull && docker compose up -d --build
    - Run database migrations
    - Health check: curl /health
```

Store secrets in GitHub Actions secrets: `SSH_PRIVATE_KEY`, `SERVER_HOST`, `SERVER_USER`, `BOT_TOKEN`, `JWT_SECRET`, `DATABASE_URL`.

---

### 6.6 — Health checks and readiness probes
**Files:** `apps/api/src/server.ts` (extend existing), `docker/docker-compose.yml`

- Extend `GET /health` to check database connectivity: `prisma.$queryRaw('SELECT 1')`
- Return `{ status: "ok", db: "ok", uptime: X }` or `{ status: "degraded", db: "error" }` with 503
- Add `healthcheck` to each Docker service in compose file

---

### 6.7 — Telegram bot: switch to webhook mode for production
**File:** `apps/telegram-bot/src/index.ts`

- In development: use long-polling (`bot.launch()`)
- In production: use webhook mode (`bot.launch({ webhook: { domain, port } })`)
- Nginx routes `/webhook` to the bot's webhook endpoint
- Add `WEBHOOK_DOMAIN` and `WEBHOOK_PORT` env vars

---

### 6.8 — Production deployment checklist
**File:** `DEPLOY.md` (create)

Document step-by-step:
1. Provision server (Ubuntu 22.04 recommended, min 2GB RAM)
2. Install Docker + Docker Compose
3. Clone repo, copy `.env.production` from template
4. Run `docker compose -f docker/docker-compose.yml up -d`
5. Verify health: `curl https://yourdomain.com/api/health`
6. Create first admin: `docker compose exec api npm run seed:admin`
7. Set Telegram webhook: `curl https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://yourdomain.com/webhook`

---

## Definition of Done

- [ ] `docker compose up` starts all services (DB, API, dashboard, bot, Nginx)
- [ ] API accessible at `http://localhost/api`
- [ ] Admin dashboard accessible at `http://localhost`
- [ ] Telegram bot responds in production webhook mode
- [ ] CI pipeline passes on every push (lint, build, test)
- [ ] Deploy pipeline auto-deploys on push to `main`
- [ ] Database migrations run automatically on deploy
- [ ] `/health` endpoint checks DB connectivity
- [ ] DEPLOY.md documents the full production setup
