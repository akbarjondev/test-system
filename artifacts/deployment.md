# Deployment Runbook — Phase 4 (Railway)

Target: **Railway** (Cloud PaaS). See ADR-005 in `artifacts/decisions.md` for rationale.

---

## Overview

Three services deployed from the monorepo root:

| Service          | Root directory             | Build command              | Start command             |
|------------------|----------------------------|-----------------------------|---------------------------|
| `api`            | `apps/api`                 | `npm run build`             | `npm start`               |
| `admin-dashboard`| `apps/admin-dashboard`     | `npm run build`             | `npm start`               |
| `telegram-bot`   | `apps/telegram-bot`        | `npm run build`             | `npm start`               |

One **managed PostgreSQL** add-on shared by the API service.

---

## Step 1: Required Environment Variables

### API service (`apps/api`)

| Variable       | Required | Description                                           |
|----------------|----------|-------------------------------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string (from Railway DB add-on) |
| `JWT_SECRET`   | Yes      | Random string ≥ 32 chars. Never `"secret"` in prod.  |
| `PORT`         | No       | Railway sets this automatically                       |
| `NODE_ENV`     | Yes      | `production`                                          |

### Admin Dashboard service (`apps/admin-dashboard`)

| Variable           | Required | Description                                      |
|--------------------|----------|--------------------------------------------------|
| `API_URL`          | Yes      | Internal Railway URL of the API service          |
| `NEXTAUTH_SECRET`  | If used  | Required if NextAuth is added later              |
| `NODE_ENV`         | Yes      | `production`                                     |

### Telegram Bot service (`apps/telegram-bot`)

| Variable             | Required | Description                                   |
|----------------------|----------|-----------------------------------------------|
| `TELEGRAM_BOT_TOKEN` | Yes      | From @BotFather on Telegram                   |
| `API_URL`            | Yes      | Internal Railway URL of the API service       |
| `WEBHOOK_URL`        | Yes (prod)| Public HTTPS URL for the bot webhook          |
| `NODE_ENV`           | Yes      | `production`                                  |

---

## Step 2: Railway Project Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Authenticate
railway login

# Create new project
railway init
# Choose "Empty project", name it "test-system"
```

---

## Step 3: Add PostgreSQL Add-on

1. In Railway dashboard → your project → **New Service** → **Database** → **PostgreSQL**
2. Railway provisions a managed PostgreSQL instance and exposes `DATABASE_URL` as a variable
3. Link the variable to the **api** service: in the api service settings, add a **shared variable reference** to `${{Postgres.DATABASE_URL}}`

---

## Step 4: Configure Services

Create `railway.json` at the repo root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Per-service configuration is set in the Railway dashboard (or via `railway.toml` per service directory). For each service, set:

- **Root directory**: the service's app path (e.g. `apps/api`)
- **Build command**: `cd ../.. && npm install && npm run build --filter=@test-system/api`
- **Start command**: `node apps/api/dist/server.js`

> Alternatively, Railway's nixpacks will auto-detect Node.js and use `package.json` scripts. Set the watch path to the service's directory.

---

## Step 5: Database Migration on Deploy

Add a **release command** to the API service in Railway:

```bash
npx prisma migrate deploy
```

This runs after build and before the new version starts serving traffic. It applies any pending migrations from `packages/database/prisma/migrations/` using the production `DATABASE_URL`.

**Important:** Never run `prisma migrate dev` in production — it prompts interactively and creates migration files. Only `prisma migrate deploy` in production.

---

## Step 6: Telegram Bot Webhook Setup

In development the bot uses **long polling** (`bot.start()` in grammy). In production, switch to **webhook** mode to reduce latency and avoid Railway's idle timeout killing the polling process.

Update `apps/telegram-bot/src/bot.ts` for production:

```typescript
import { webhookCallback } from "grammy";
import express from "express";

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  const WEBHOOK_URL = process.env.WEBHOOK_URL;
  if (!WEBHOOK_URL) throw new Error("WEBHOOK_URL is required in production");

  // Register webhook with Telegram
  bot.api.setWebhook(`${WEBHOOK_URL}/webhook`);

  // Handle incoming updates via HTTP
  app.post("/webhook", webhookCallback(bot, "express"));
  app.get("/health", (_, res) => res.json({ status: "OK" }));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Bot webhook listening on port ${PORT}`));
} else {
  // Development: long polling
  bot.start();
}
```

Set `WEBHOOK_URL` in Railway to the bot service's public URL (e.g. `https://test-system-bot.up.railway.app`).

---

## Step 7: Health Check Endpoint

The API already exposes `GET /health` → `{ "status": "OK", "timestamp": "..." }`.

Configure Railway health check:
- **Path:** `/health`
- **Timeout:** 10s
- **Interval:** 30s

This prevents Railway from routing traffic to an unhealthy instance during deploys.

---

## Step 8: Deploy

```bash
# Deploy all services from monorepo root
railway up

# Or deploy a specific service
railway up --service api
```

Monitor deploy logs:
```bash
railway logs --service api
```

---

## Step 9: Seed Admin User (first deploy only)

After the first successful deploy and migration:

```bash
# Run seed script via Railway CLI
railway run --service api -- node dist/scripts/seed-admin.js
```

Or set it as a one-time job in the Railway dashboard.

---

## Rollback Procedure

### Option A: Redeploy previous version

```bash
# In Railway dashboard → Deployments → click previous deployment → Redeploy
```

### Option B: Via CLI

```bash
railway deployments list --service api
railway rollback <deployment-id> --service api
```

### Database rollback

Railway does not auto-rollback migrations. If a migration causes issues:

1. Connect to the Railway PostgreSQL instance:
   ```bash
   railway connect postgres
   ```
2. Manually reverse the migration SQL, or restore from Railway's automatic daily backup (available in the PostgreSQL add-on dashboard).

> Always write reversible migrations. For destructive changes (DROP COLUMN, etc.), add a separate down-migration script before deploying.

---

## Environment Checklist (Pre-deploy)

- [ ] `JWT_SECRET` is a random ≥ 32-char string (not `"secret"`)
- [ ] `DATABASE_URL` points to Railway PostgreSQL (not local)
- [ ] `NODE_ENV=production` on all services
- [ ] `TELEGRAM_BOT_TOKEN` is the production bot token (not a test bot)
- [ ] `WEBHOOK_URL` is the Railway bot service URL (HTTPS)
- [ ] `API_URL` on dashboard and bot points to Railway API service URL
- [ ] Release command `npx prisma migrate deploy` set on API service
- [ ] Health check configured on API service (`/health`)
- [ ] CORS configured in `apps/api/src/server.ts` to allow the dashboard's Railway URL
