---
name: Pre-publish checklist
overview: A production-readiness checklist covering API, frontend, and infra, with concrete gaps and implementation notes based on the current test-system codebase.
todos: []
---

# Pre-publish Production Readiness Checklist

Checklist format: each item is a verifiable task. Items marked **Gap** are missing or insufficient in the current codebase; **Review** are best-practice checks.

---

## 1. API – Security

### 1.1 CORS

- **Gap.** [apps/api/src/server.ts](apps/api/src/server.ts) uses `app.use(cors())` with no options: any origin is allowed.
- **Task:** Configure `cors({ origin: [...] }) `from `ALLOWED_ORIGINS` (or `NODE_ENV`-based list). Restrict credentials if not needed. Exclude `/api-docs` from strict CORS if served to internal tools only.

### 1.2 Rate limiting

- **Gap.** `express-rate-limit` is in [apps/api/package.json](apps/api/package.json) but not used in [apps/api/src/server.ts](apps/api/src/server.ts).
- **Task:** Apply `rateLimit()` globally (e.g. 100–200 req/15min per IP). Add a stricter limit for `/api/auth/login` and `/api/auth/register` (e.g. 5–10/15min) to reduce brute-force and enumeration.

### 1.3 Request body size

- **Gap.** `express.json()` has no `limit`. Large bodies can cause DoS.
- **Task:** Set `express.json({ limit: "500kb" })` (or similar). Reject with 413 if over limit.

### 1.4 Security headers (Helmet)

- **Done.** `helmet()` is used. **Review:** Confirm Helmet defaults are acceptable; override only if you need to allow specific framing/script sources (e.g. embedded dashboards).

### 1.5 Auth and secrets

- **Gap.** [packages/shared/auth.ts](packages/shared/auth.ts): `JWT_SECRET` falls back to `"secret"` if unset. Unacceptable in production.
- **Task:** Require `JWT_SECRET` at startup when `NODE_ENV=production`. Use a strong, non-default value and never commit it.

---

## 2. API – Error handling and resilience

### 2.1 Central error handler

- **Gap.** Controllers use per-handler `try/catch` and `console.log(error)`. Uncaught errors and unhandled rejections are not centralized; some paths may leak stack or 500 without a consistent shape.
- **Task:** Add an Express error-handling middleware (last `app.use((err, req, res, next) => {...})`). Responsibilities:
- Map known errors (e.g. `"Test not found"`, `"Unauthorized"`, `TIME_LIMIT_EXCEEDED`) to HTTP status and a stable `{ error, code? }` JSON.
- For 5xx: log with a logger (see 2.3), return a generic `{ error: "Internal server error" }`; in production do not send stack or internal messages to the client.

### 2.2 404 and 405

- **Gap.** No `app.use` for unknown routes or method-not-allowed. Unmatched routes are handled by Express default (often HTML 404).
- **Task:** Register a 404 handler that returns JSON `{ error: "Not found" }` and a 405 handler if you explicitly support certain methods per route.

### 2.3 Logging

- **Gap.** Only `console.log`/`console.error` in [apps/api/src](apps/api/src) (e.g. [apps/api/src/controllers/tests.controller.ts](apps/api/src/controllers/tests.controller.ts), [apps/api/src/middlewares/auth.ts](apps/api/src/middlewares/auth.ts)). No levels, structure, or request IDs.
- **Task:** Introduce a small structured logger (e.g. **pino** or **winston**):
- Log level from `LOG_LEVEL` (default `info`; `debug` in development).
- Per-request fields: `requestId`, `method`, `path`, `status`, `duration`. Use a middleware to generate `requestId` (e.g. `X-Request-Id` or `crypto.randomUUID()`).
- Replace `console.log(error)` with `logger.error({ err, requestId })` in catches and in the central error handler. Ensure 5xx and auth failures are logged.

---

## 3. API – Input validation and consistency

### 3.1 Request validation

- **Gap.** Controllers do ad-hoc checks (e.g. `!email || !password`, `"Text and options are required"`). No shared schemas, no validation for types (email format, string length, array size, `cuid`-like ids).
- **Task:** Add validation (e.g. **Zod** or **express-validator**):
- Define schemas for: `register`, `login`, create/update `Test`, create/update `Question`, start attempt, submit answer.
- Validate in middleware or at controller entry; on failure return 400 with a consistent `{ error, details? }` shape. Optionally surface Zod `issues` in non-production.

### 3.2 Error response shape

- **Review.** Swagger references `Error` with `message`/`error`. Controllers currently use `{ error: "..." }`. Standardize one format (e.g. `{ error: string, code?: string }`) and align Swagger and central handler.

---

## 4. API – Configuration and startup

### 4.1 Env validation at boot

- **Gap.** `DATABASE_URL` is checked in [packages/database/lib/prisma.ts](packages/database/lib/prisma.ts) when Prisma is first used. `JWT_SECRET` and `PORT` have defaults. No single place that fails fast if required production vars are missing.
- **Task:** At API startup (before `app.listen`), validate required env:
- `DATABASE_URL` (or rely on existing Prisma check but fail before listening).
- `JWT_SECRET` in production.
- Optional: `NODE_ENV`, `PORT`, `ALLOWED_ORIGINS`. Use a small schema (e.g. Zod) and `process.exit(1)` with a clear message if invalid.

### 4.2 Health check

- **Gap.** [server.ts](apps/api/src/server.ts) `GET /health` returns `{ status: "OK", timestamp }` only. No DB or dependency checks.
- **Task:** Extend `/health` (or add `/health/ready`):
- **Liveness:** keep current or minimal check.
- **Readiness:** run `prisma.$queryRaw\`SELECT 1\`` (or equivalent). If it fails, return 503. This supports orchestrators (Kubernetes, Docker) and load balancers.

---

## 5. API – Operational and maintenance

### 5.1 Graceful shutdown

- **Gap.** `app.listen` has no handling for `SIGTERM`/`SIGINT`. In-place deploys or restarts can interrupt in-flight requests.
- **Task:** On `SIGTERM`/`SIGINT`: stop accepting new connections (`server.close()`), await in-flight requests (optionally with a timeout), then disconnect Prisma and `process.exit(0)`.

### 5.2 API docs in production

- **Review.** `/api-docs` and `/api-docs.json` are always mounted. Decide: disable or restrict (e.g. by IP or `NODE_ENV`) in production to avoid leaking structure.

---

## 6. Frontend (admin-dashboard)

### 6.1 Security and CSP

- **Review.** [apps/admin-dashboard/next.config.ts](apps/admin-dashboard/next.config.ts) is empty. **Task:** Add security headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and a basic Content-Security-Policy. E.g. use `headers` in `next.config.ts` or a middleware.

### 6.2 Error boundaries and loading

- **Gap.** No `error.tsx` / `global-error.tsx` or loading UIs detected. **Task:** Add route-level `error.tsx` and root `global-error.tsx`; add `loading.tsx` where needed so the app degrades gracefully and does not show raw errors to users.

### 6.3 Environment and API base URL

- **Review.** When the dashboard will call the API: **Task:** Use `NEXT_PUBLIC_API_URL` (or similar) for the backend. Ensure it is set in production and matches CORS `ALLOWED_ORIGINS`.

---

## 7. Database and migrations

### 7.1 Migrations

- **Review.** [packages/database/prisma/migrations](packages/database/prisma/migrations) exists. **Task:** In CI/deploy, run `prisma migrate deploy` (or equivalent) before starting the API. Never use `db push` in production.

### 7.2 Connection and pooling

- **Review.** Prisma with pg adapter is used. **Task:** Confirm `DATABASE_URL` and Prisma/client pooling are suitable for production concurrency. Document max connections and any PgBouncer/pooler usage.

---

## 8. Docker and deployment

### 8.1 Dockerfile and env

- **Review.** [docker/api.Dockerfile](docker/api.Dockerfile) and [docker/docker-compose.yml](docker/docker-compose.yml). **Task:** Ensure `JWT_SECRET`, `DATABASE_URL`, `ALLOWED_ORIGINS`, and `NODE_ENV` are passed at runtime (env or secrets), not baked into the image. Prefer `migrate deploy` in the entrypoint or a dedicated init container over `db:push`.

### 8.2 Non-root user

- **Review.** **Task:** Run the API process as a non-root user in the container.

### 8.3 Health in compose

- **Task:** If you use `docker compose` or K8s, point liveness/readiness at `GET /health` (and `/health/ready` if you add it).

---

## 9. Observability and documentation

### 9.1 Logging and errors

- Covered in **2.3** (structured logger, requestId, error logging). **Task:** Ensure logs are shipped to your platform (stdout is enough if a collector scrapes it).

### 9.2 OpenAPI / Swagger

- **Done.** Swagger is set up. **Task:** After adding central error handling and validation, update Swagger schemas and examples so they match real 4xx/5xx and request/response bodies.

### 9.3 README and runbooks

- **Task:** Document: required env vars, `docker:dev` / `docker:down`, `migrate deploy`, how to run API and admin-dashboard in prod, and where to find logs and health.

---

## 10. Dependency and build hygiene

### 10.1 Vulnerabilities

- **Task:** Run `npm audit` (and `npm audit fix` where safe). Fix or accept critical/high. Enforce in CI.

### 10.2 Lockfile and install

- **Task:** Use `npm ci` in Docker and CI. Pin Node version in Dockerfile and/or `.nvmrc`.

### 10.3 Build and type-check

- **Task:** CI runs `turbo run build` and `turbo run lint`. Ensure `tsc --noEmit` or equivalent runs for the API and frontend.

---

## Suggested order of work

1. **Env and secrets:** 4.1, 1.5 (fail fast, no default JWT secret in prod).
2. **Resilience:** 2.1 (central error handler), 2.2 (404/405), 2.3 (logger), 4.2 (health/readiness), 5.1 (graceful shutdown).
3. **Security:** 1.1 (CORS), 1.2 (rate limit), 1.3 (body limit), 1.5 (already in step 1).
4. **Validation:** 3.1, 3.2.
5. **Frontend:** 6.1, 6.2, 6.3.
6. **Deploy and ops:** 7.1, 7.2, 8.1–8.3, 9.3, 10.1–10.3.

---

## Format for the checklist artifact

You can turn this into a markdown checklist file (e.g. `docs/PRE_PUBLISH_CHECKLIST.md`) with:

- `- [ ]` for each task.
- Short “how to verify” lines (e.g. “CORS: from browser on allowed origin, no CORS error; from disallowed origin, request blocked or CORS error”).
- References to the files or modules to change.

If you want, the next step can be to generate that `PRE_PUBLISH_CHECKLIST.md` and, for a subset of items, to outline concrete code edits (e.g. CORS, rate limit, central error handler, and logger) in the repo.