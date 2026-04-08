# CLAUDE.md

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
| `packages/database`         | Prisma schema + generated client + migrations        | —    |
| `packages/shared`           | JWT sign/verify utilities                            | —    |
| `packages/types`            | Shared TypeScript types                              | —    |
| `packages/ui`               | Shared UI components (shadcn/Radix)                  | —    |
| `packages/typescript-config`| Shared tsconfig                                      | —    |

---

## Key Commands

```bash
npm run dev                                         # Start all apps (Turborepo)
npm run docker:dev                                  # Start Postgres only (Podman/Docker)
npm run build                                       # Build all apps
npm run lint                                        # Lint all apps

cd packages/database && npm run db:migrate          # prisma migrate dev (create + apply)
cd packages/database && npm run db:generate         # Regenerate Prisma client after schema change
cd packages/database && npm run db:studio           # Open Prisma Studio

cd apps/api && npm run seed:admin                   # Seed initial admin user
```

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
1. `POST /api/auth/login` → API returns `{ token: string }`
2. Dashboard stores token via `apps/admin-dashboard/proxy.ts` in httpOnly cookie
3. Every protected request: `Authorization: Bearer <token>` → `verifyTokenMiddleware` verifies + attaches `req.user`

---

## Conventions

- **TypeScript strict** everywhere
- **Zod schemas** always in `apps/api/src/config/schemas.ts` — never inline in route files
- **Prisma only** — no raw SQL, ever
- **Server actions** in `apps/admin-dashboard/actions/<domain>.ts`
- **No `console.log`** in committed code
- **Error responses**: `{ error: string, code?: string }`
- **Validation errors**: `{ error: "Validation failed", details: [{ field, message }] }`
- **File naming**: camelCase for files, PascalCase for React components / classes

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
