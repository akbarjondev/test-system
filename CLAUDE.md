# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Online test/quiz/assessment platform. Admins create and manage tests via a web dashboard. Students take tests
via Telegram bot or Flutter mobile app. **No student-facing web pages** — Telegram + Flutter only.

---

## Monorepo Map

| App / Package               | Purpose                                              | Port |
|-----------------------------|------------------------------------------------------|------|
| `apps/admin-dashboard`      | Next.js 16 admin UI — create/manage tests, results   | 3000 |
| `apps/api`                  | Express 5 REST API — all business logic              | 5000 |
| `apps/telegram-bot`         | grammy Telegram bot — student test-taking interface  | —    |
| `apps/mini-app`             | Vite/React Telegram Mini App — student test-taking   | 5173 |
| `packages/database`         | Prisma schema + generated client + migrations        | —    |
| `packages/shared`           | JWT sign/verify utilities                            | —    |
| `packages/types`            | Shared TypeScript types                              | —    |
| `packages/ui`               | Shared UI components (shadcn/Radix)                  | —    |
| `packages/typescript-config`| Shared tsconfig                                      | —    |

---

## Key Commands

```bash
npm run dev                                         # Start all apps locally (Turborepo)
npm run build                                       # Build all apps
npm run lint                                        # Lint all apps

# Docker — dev (all services, hot-reload, hardcoded creds)
npm run docker:dev                                  # Start full dev stack (Postgres + API + dashboard + bot + mini-app)
npm run docker:dev:down                             # Stop dev stack

# Docker — prod (all services, reads from .env at repo root)
npm run docker:prod                                 # Build & start prod stack (detached)
npm run docker:prod:down                            # Stop prod stack

cd packages/database && npm run db:migrate          # prisma migrate dev (create + apply)
cd packages/database && npm run db:generate         # Regenerate Prisma client after schema change
cd packages/database && npm run db:studio           # Open Prisma Studio

cd apps/api && npm run seed:admin                   # Seed initial admin user
```

---

## Docker

Two compose files, both under `docker/`, build context is always the repo root (`..`):

| File                          | Purpose                                      |
|-------------------------------|----------------------------------------------|
| `docker/docker-compose.yml`   | Dev — all services, volume mounts, hot-reload |
| `docker/docker-compose.prod.yml` | Prod — built images, no mounts           |

**Dev stack** (`docker-compose.yml`): all services share a single `docker/dev.Dockerfile` that installs deps and pre-generates the Prisma client. Source code is bind-mounted, so changes reflect immediately. Credentials are hardcoded (Postgres: `postgres/password`, JWT: `dev-secret-change-in-prod`).

**Prod stack** (`docker/docker-compose.prod.yml`): each service has its own Dockerfile (`api.Dockerfile`, `admin.Dockerfile`, `bot.Dockerfile`, `mini-app.Dockerfile`). Reads secrets from a `.env` file at the **repo root** — copy `docker/.env.example` and fill in values before first run.

Key behaviours:
- API container runs `prisma migrate deploy` automatically on startup (both dev and prod)
- `VITE_API_URL` must be a browser-reachable URL (not `http://api:5000`) — the mini-app JS runs in the user's browser
- Mini-app is served by nginx on port 80 in prod, by Vite dev server on port 5173 in dev

---

## Architecture

**API request path:**
```
Client
  → helmet (security headers)
  → cors
  → express.json (body parsing)
  → rate-limit (100 req/min per IP)
  → router
      → validate(zodSchema)          [Zod middleware — body routes only]
      → verifyTokenMiddleware        [JWT check, attaches req.user]
      → verifyAdminMiddleware        [role check — admin-only routes]
      → Controller
          → Service
              → Repository
                  → Prisma → PostgreSQL
```

**Auth per client type:**

| Client            | Token storage          | How sent to API                     |
|-------------------|------------------------|-------------------------------------|
| Admin dashboard   | httpOnly cookie (proxy)| `proxy.ts` forwards as Bearer token |
| Telegram bot      | grammY session         | `Authorization: Bearer <token>`     |
| Flutter app       | Secure storage         | `Authorization: Bearer <token>`     |

**JWT flow:**
1. `POST /api/auth/login` → API returns `{ token, user }`
2. Dashboard stores token via `apps/admin-dashboard/proxy.ts` in httpOnly cookie
3. Every protected request: `Authorization: Bearer <token>` → `verifyTokenMiddleware` verifies + attaches `req.user`

---

## Conventions

- **TypeScript strict** everywhere
- **Zod schemas** always in `apps/api/src/config/schemas.ts` — never inline in route files
- **Prisma only** — no raw SQL, ever
- **Server actions** in `apps/admin-dashboard/actions/<domain>.ts` — marked `"use server"`, call API via `fetch` using `getToken()` from `lib/server-utils`
- **No `console.log`** in committed code
- **Error responses**: `{ error: string, code?: string }`
- **Validation errors**: `{ error: "Validation failed", details: [{ field, message }] }`
- **File naming**: camelCase for files (e.g. `tests.controller.ts`), PascalCase for React components / classes
- **Prisma client import**: `import { ... } from "@test-system/database/prisma/generated/client"`
- **Shared types import**: `import { ... } from "@test-system/types"`
- **No test scripts** exist in this repository

---

## Data Model

Core models: `User` (role: `ADMIN | STUDENT`), `Test`, `Question`, `Option`, `TestAttempt`, `QuestionOrder`, `Answer`, `BotSession`.

Key business rules:
- Questions are shuffled per attempt via `QuestionOrder` (stores `displayOrder` per attempt)
- `Answer` has a unique constraint per `(attemptId, questionId)`
- Tests support: time limits, optional 3-digit password, scheduled availability windows, passing score threshold, one-attempt-only restriction

API docs (Swagger UI) available at `http://localhost:5000/api-docs` when the API is running.

---

## Current State

| Phase | Description                                        | Status      |
|-------|----------------------------------------------------|-------------|
| 1     | Monorepo setup, DB schema, auth, base API          | ✅ Done     |
| 2     | Full API — tests, questions, attempts, users       | ✅ Done     |
| 3     | Admin dashboard — all pages and actions            | ✅ Done     |
| 4     | Production deployment — Railway (Cloud PaaS)       | 🔜 Next     |
| 5     | Flutter mobile app for students                    | Planned     |
| 6     | Telegram bot polish + webhook production mode      | Planned     |

---

## Must NOT Do

- Break Prisma cascade deletes: `Test → Question → Option / QuestionOrder / Answer`
- Write raw SQL — Prisma only
- Skip Zod validation on any new API route (every mutating route needs `validate(schema)`)
- Hardcode environment variables — always read from `process.env`
- Create student-facing web pages — students use Telegram bot + Flutter only
- Put Zod schemas inline in route files — they belong in `apps/api/src/config/schemas.ts`
- Add `console.log` to committed code

---

## Artifacts Index

Detailed reference docs in `/artifacts/`: 

| File                               | Contents                                              |
|------------------------------------|-------------------------------------------------------|
| `artifacts/architecture.md`        | Component diagram, data flows, middleware chain       |
| `artifacts/api-reference.md`       | Complete endpoint reference with auth, body, response |
| `artifacts/data-model.md`          | Prisma schema with business context per model         |
| `artifacts/decisions.md`           | Architecture Decision Records (ADR-001 – ADR-005)     |
| `artifacts/deployment.md`          | Railway deployment runbook (Phase 4)                  |
| `artifacts/conventions.md`         | Copy-paste patterns for adding routes, actions, models|
