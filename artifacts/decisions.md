# Architecture Decision Records

| #       | Title                                                         | Status   |
|---------|---------------------------------------------------------------|----------|
| ADR-001 | Turborepo monorepo                                            | Accepted |
| ADR-002 | No web student portal — Telegram + Flutter only               | Accepted |
| ADR-003 | JWT auth (httpOnly cookie for dashboard, Bearer for bot/app)  | Accepted |
| ADR-004 | Prisma + PostgreSQL only — no raw SQL                         | Accepted |
| ADR-005 | Cloud PaaS deployment (Railway) over self-hosted VPS          | Accepted |

---

## ADR-001: Turborepo Monorepo

**Context:** The system has three distinct runnable apps (admin dashboard, API, Telegram bot) and shared code (auth utilities, Prisma client, TypeScript types, UI components). These could be managed as separate repositories or as a single monorepo.

**Decision:** Use Turborepo with npm workspaces as the monorepo tool. All apps live under `apps/`, all shared packages under `packages/`. Turborepo handles build orchestration, caching, and parallel task execution. A single `npm run dev` starts all services.

**Consequences:** Shared code is easy to change atomically (e.g., adding a field to `packages/types` is immediately visible to all consumers without publishing). Local cross-package imports use workspace aliases (`@test-system/database`, `@test-system/shared`). The trade-off is a heavier root `node_modules` and slightly more complex CI setup — but Turborepo's remote caching mitigates CI build times. Railway natively supports Turborepo monorepo deployments (multiple services from one repo), which informed the PaaS selection.

---

## ADR-002: No Web Student Portal — Telegram + Flutter Only

**Context:** Students need a way to take tests. Options included: (a) a separate Next.js student web app, (b) Telegram bot only, (c) Flutter mobile app only, or (d) Telegram bot + Flutter mobile app with no web portal.

**Decision:** Students interact exclusively via the Telegram bot (already built) and a Flutter mobile app (planned for Phase 5). No student-facing web pages will be created.

**Consequences:** This simplifies the admin dashboard (it is purely administrative, not dual-purpose). Telegram has near-universal adoption in the target user base, making onboarding frictionless — no app install required for the bot. Flutter provides a native mobile experience for users who prefer an app. The trade-off is that students on desktop browsers cannot take tests without Telegram Desktop. Any feature request to add a student web portal should be pushed back — it contradicts this decision and would require significant dashboard refactoring.

---

## ADR-003: JWT Auth (httpOnly Cookie for Dashboard, Bearer for Bot/App)

**Context:** The system needs authentication for three client types: a web admin dashboard, a Telegram bot, and a Flutter mobile app. Options included: session-based auth (server-side sessions + cookies), JWT with localStorage, JWT with httpOnly cookies, or JWT with Bearer tokens (no cookies).

**Decision:** Use JWT for all clients (single auth mechanism, stateless API). The delivery mechanism differs by client:
- **Admin dashboard:** JWT stored in an httpOnly cookie managed by a Next.js proxy route (`proxy.ts`). The dashboard never exposes the token to JavaScript.
- **Telegram bot:** JWT stored in grammY's in-memory session. Sent as `Authorization: Bearer <token>`.
- **Flutter app:** JWT stored in Flutter secure storage. Sent as `Authorization: Bearer <token>`.

**Consequences:** The API is purely stateless — no session store needed. The httpOnly cookie on the dashboard prevents XSS token theft. The proxy adds a small layer of indirection for the dashboard but is worth it for security. The bot's in-memory session means tokens are lost on bot restart (users must re-login) — acceptable for the MVP. If the bot is later switched to a database-backed session, no API changes are needed.

---

## ADR-004: Prisma + PostgreSQL Only — No Raw SQL

**Context:** The project needs a database ORM or query builder. Options: raw `pg` driver, Knex.js query builder, Prisma ORM, or TypeORM.

**Decision:** Prisma as the ORM with PostgreSQL as the sole database engine. `packages/database` contains the schema, migrations, and re-exports the generated client. All data access goes through Prisma — no raw SQL, no `$queryRaw` (except as an absolute last resort, pre-approved).

**Consequences:** The Prisma schema (`schema.prisma`) is the single source of truth for the database structure. Migrations are version-controlled in `packages/database/prisma/migrations/`. The generated TypeScript client provides full type safety from DB to controller. Cascade delete rules are expressed in the schema and enforced at the DB level. The trade-off is that complex analytics queries are more verbose in Prisma than raw SQL — but the project has no complex reporting needs today. If it does in future, Prisma's `$queryRaw` with tagged templates is the sanctioned escape hatch (not ad-hoc string concatenation).

---

## ADR-005: Cloud PaaS Deployment (Railway) Over Self-Hosted VPS

**Context:** Phase 4 requires deploying the monorepo to production. Options: self-hosted VPS (DigitalOcean, Hetzner), Kubernetes (overkill), or Cloud PaaS (Railway, Render, Fly.io).

**Decision:** Deploy to **Railway**. Rationale:
1. Railway natively understands Turborepo monorepos — multiple services can be configured from a single repo with per-service build/start commands.
2. Built-in managed PostgreSQL add-on (no separate DB provisioning).
3. Uses nixpacks auto-detection — no Dockerfiles needed for the API or bot.
4. Next.js dashboard deployed with zero additional config.
5. Per-service environment variable management in the Railway dashboard.
6. `railway.json` config file enables infrastructure-as-code for the deployment.

**Consequences:** Railway's free tier is limited; the project will need a paid plan for production use. Railway abstracts away server management — no SSH, no nginx config, no SSL cert renewal. The trade-off vs. a VPS is less control and higher per-unit cost at scale, but for this project's scale, the developer-time savings outweigh the cost difference. See `artifacts/deployment.md` for the full runbook.
