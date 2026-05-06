# GitHub Copilot Instructions

## Project Overview

Online test/quiz/assessment platform. Admins manage via a Next.js dashboard. Students take tests via Telegram bot or Flutter app. **There are no student-facing web pages.**

## Monorepo Structure (Turborepo + npm workspaces)

| Path | Purpose | Port |
|------|---------|------|
| `apps/admin-dashboard` | Next.js 15 admin UI | 3000 |
| `apps/api` | Express 5 REST API | 5000 |
| `apps/telegram-bot` | grammy Telegram bot | — |
| `packages/database` | Prisma schema, generated client, migrations | — |
| `packages/shared` | JWT sign/verify utilities | — |
| `packages/types` | Shared TypeScript types | — |
| `packages/ui` | Shared UI components (shadcn/Radix) | — |

## Commands

```bash
# Root
npm run dev           # Start all apps via Turborepo
npm run build         # Build all apps
npm run lint          # Lint all apps
npm run docker:dev    # Start Postgres with Podman/Docker

# Database (run from packages/database)
npm run db:migrate    # prisma migrate dev
npm run db:generate   # Regenerate Prisma client after schema changes
npm run db:studio     # Open Prisma Studio

# API (run from apps/api)
npm run seed:admin    # Seed initial admin user
```

There are no test scripts in this repository.

## API Request Pipeline

Every API request flows through this chain (defined in `apps/api/src/server.ts`):

```
Client → helmet → cors → express.json → rate-limit (100 req/min)
  → router
      → validate(zodSchema)        [Zod middleware, body routes only]
      → verifyTokenMiddleware      [JWT check, attaches req.user]
      → verifyAdminMiddleware      [role check, admin-only routes]
      → Controller → Service → Repository → Prisma → PostgreSQL
```

## Authentication Flow

- `POST /api/auth/login` returns `{ token, user }`
- **Admin dashboard**: token stored in httpOnly cookie; `apps/admin-dashboard/proxy.ts` (Next.js middleware) forwards it as `Authorization: Bearer <token>` and handles route guards
- **Telegram bot**: token stored in grammY session, sent as `Authorization: Bearer <token>`
- **Flutter app**: token in secure storage, sent as `Authorization: Bearer <token>`

## Key Conventions

### API Layer (`apps/api`)
- All Zod schemas go in `apps/api/src/config/schemas.ts` — never inline in route files
- Every mutating route must use `validate(schema)` middleware
- Error responses: `{ error: string, code?: string }`
- Validation error responses: `{ error: "Validation failed", details: [{ field, message }] }`
- File naming: camelCase (e.g., `tests.controller.ts`, `users.service.ts`, `tests.repository.ts`)

### Admin Dashboard (`apps/admin-dashboard`)
- Server actions live in `apps/admin-dashboard/actions/<domain>.ts` and are marked `"use server"`
- Server actions call the API directly via `fetch` with `Authorization: Bearer <token>` (token retrieved via `getToken()` from `lib/server-utils`)
- React components are PascalCase

### Database (`packages/database`)
- **Prisma only** — no raw SQL ever
- Cascade deletes are critical: `Test → Question → Option / QuestionOrder / Answer`
- Do not remove or change `onDelete: Cascade` on these relations
- Prisma client output path: `packages/database/prisma/generated/client`
- Import Prisma client as: `import { ... } from "@test-system/database/prisma/generated/client"`

### Shared Types (`packages/types`)
- All shared TypeScript interfaces exported from `packages/types/index.ts`
- Imports: `import { ... } from "@test-system/types"`

### General
- TypeScript strict mode everywhere
- No `console.log` in committed code
- No hardcoded environment variables — always use `process.env`
- Do not create student-facing web pages

## Data Model Summary

Core models: `User` (role: ADMIN | STUDENT), `Test`, `Question`, `Option`, `TestAttempt`, `QuestionOrder`, `Answer`, `BotSession`.

- Questions are shuffled per attempt via `QuestionOrder` (stores `displayOrder` per attempt)
- `Answer` has a unique constraint per `(attemptId, questionId)`
- Tests support: time limits, optional password (3-digit), scheduled availability windows, passing score thresholds, one-attempt-only restriction

## Swagger / API Docs

API documentation available at `http://localhost:5000/api-docs` (Swagger UI) and `http://localhost:5000/api-docs.json` when the API is running.
Full endpoint reference: `artifacts/api-reference.md`.

## Reference Docs

Detailed reference in `/artifacts/`:
- `architecture.md` — component diagram, middleware chain
- `api-reference.md` — complete endpoint reference
- `data-model.md` — Prisma schema with business context
- `decisions.md` — Architecture Decision Records
- `conventions.md` — copy-paste patterns for adding routes, actions, models
