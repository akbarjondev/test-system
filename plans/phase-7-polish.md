# Phase 7 — Polish & Observability

**Goal:** Post-launch cleanup: monitoring, error tracking, performance, accessibility, and codebase hygiene.
**Depends on:** Phase 6 (running in production)
**Blocks:** Nothing — iterative improvements.

---

## Context

Once the app is live, this phase cleans up accumulated technical debt, adds visibility into production health, and ensures the experience is polished. Items here were intentionally deferred to keep earlier phases focused.

---

## Tasks

### 7.1 — Error tracking (Sentry)
**Files:** `apps/api/src/config/sentry.ts`, `apps/admin-dashboard/instrumentation.ts`, `apps/telegram-bot/src/config/sentry.ts`

- Install `@sentry/node` in API and bot, `@sentry/nextjs` in dashboard
- Initialize Sentry with `SENTRY_DSN` env var (only in production)
- API: integrate with the centralized error handler (Phase 4.2) — unhandled exceptions auto-reported
- Dashboard: use Next.js instrumentation file for server-side errors; `Sentry.ErrorBoundary` for client
- Bot: wrap top-level handlers with Sentry error capture
- Add `SENTRY_DSN` to `.env.example`

---

### 7.2 — Structured metrics / observability
**Files:** `apps/api/src/middlewares/metrics.ts`

- Expose a `GET /metrics` endpoint (Prometheus format) with:
  - Request count by route and status code
  - Response time histogram
  - Active database connections
  - Active test attempts count
- Use `prom-client` library
- Protect `/metrics` behind an internal-only Nginx rule (not publicly accessible)
- Optional: add Grafana + Prometheus to `docker-compose.yml` for a local monitoring stack

---

### 7.3 — Remove `dayjs` dependency
**File:** `apps/admin-dashboard/package.json`

- `date-fns` and `dayjs` are both installed — find and replace all `dayjs` usage with `date-fns` equivalents
- Remove `dayjs` from `package.json` and run `npm install`

---

### 7.4 — Remove or build out `packages/ui`
**File:** `packages/ui/`

Two options:
- **Remove:** If the admin dashboard uses its own local components and `packages/ui` remains unused, delete the package and remove it from workspaces
- **Build out:** If there's intent to share UI components between the dashboard and potential future apps, migrate shared components (`Button`, `Card`, `Table`, etc.) from `apps/admin-dashboard/components/ui/` to `packages/ui/`

Decision to be made based on whether a second web app is planned.

---

### 7.5 — Query optimization
**Files:** `apps/api/src/repositories/`

- Audit Prisma queries for N+1 patterns — use `include` and `select` to avoid over-fetching
- Add database indexes for common query patterns:
  - `answers.attemptId` (frequent join in attempt retrieval)
  - `test_attempts.studentId` (for my-attempts query)
  - `question_orders.attemptId` (for attempt question ordering)
- Run `EXPLAIN ANALYZE` on the most frequent queries and optimize

---

### 7.6 — Admin dashboard accessibility audit
**Files:** `apps/admin-dashboard/`

- Run `axe-core` or Lighthouse accessibility audit
- Fix critical issues (missing ARIA labels, low contrast, keyboard navigation gaps)
- Ensure all form inputs have associated labels
- Verify focus management in modal dialogs (confirmation dialogs from Phase 2)

---

### 7.7 — Uzbek i18n consistency review
**Files:** `apps/admin-dashboard/`, `apps/telegram-bot/`

- Audit all visible strings in the dashboard for consistency — some may still be in English (e.g., error messages, toast text, placeholder text)
- Audit all bot messages for tone and grammar consistency
- Consider extracting strings to a locale file (`uz.ts`) for easier future maintenance — not a full i18n framework, just a constants file

---

### 7.8 — API documentation review
**Files:** `apps/api/src/docs/`

- Update Swagger/OpenAPI docs to cover all new endpoints added in Phase 2 and 4 (user management, updated error formats)
- Add response schema examples for all endpoints
- Verify all documented request/response shapes match actual implementation

---

### 7.9 — Security audit
**Files:** Various

- Run `npm audit` across all workspaces and fix critical/high vulnerabilities
- Review JWT handling: ensure tokens are rotated on password change
- Ensure `httpOnly` + `Secure` + `SameSite=Strict` flags on dashboard auth cookies
- Verify that student users cannot access any admin API endpoints (authorization test)
- Check for any secrets accidentally committed in git history

---

## Definition of Done

- [ ] Sentry captures and reports unhandled exceptions in all three apps
- [ ] `/metrics` endpoint exposes Prometheus-format metrics
- [ ] `dayjs` removed, only `date-fns` used
- [ ] Decision made on `packages/ui` (removed or built out)
- [ ] No N+1 queries in critical API paths
- [ ] Lighthouse accessibility score > 90 for admin dashboard
- [ ] All UI strings in Uzbek (no English visible to end users)
- [ ] `npm audit` shows zero critical/high vulnerabilities
