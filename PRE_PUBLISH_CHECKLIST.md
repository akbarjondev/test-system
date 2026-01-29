# Pre-publish Production Readiness Checklist

Verifiable tasks before production. **Gap** = missing/insufficient; **Review** = best-practice check.

---

## 1. API – Security

### 1.1 CORS

- [ ] **Gap.** Configure `cors({ origin: [...] })` from `ALLOWED_ORIGINS` (or `NODE_ENV`-based list). Restrict credentials if not needed. Exclude `/api-docs` from strict CORS if served to internal tools only.  
  **Where:** `apps/api/src/server.ts` (replace `app.use(cors())`).  
  **Verify:** From allowed origin, no CORS error; from disallowed origin, request blocked or CORS error.

### 1.2 Rate limiting

- [ ] **Gap.** Apply `rateLimit()` globally (e.g. 100–200 req/15min per IP). Stricter limit for `/api/auth/login` and `/api/auth/register` (e.g. 5–10/15min).  
  **Where:** `apps/api/src/server.ts` (`express-rate-limit` is in `apps/api/package.json` but not used).  
  **Verify:** Beyond limit, responses are 429.

### 1.3 Request body size

- [ ] **Gap.** Set `express.json({ limit: "500kb" })`. Reject with 413 if over limit.  
  **Where:** `apps/api/src/server.ts`.  
  **Verify:** Request with body > limit returns 413.

### 1.4 Security headers (Helmet)

- [ ] **Review.** Confirm Helmet defaults are acceptable; override only if you need specific framing/script sources (e.g. embedded dashboards).  
  **Where:** `apps/api/src/server.ts` (Helmet already used).

### 1.5 Auth and secrets

- [ ] **Gap.** Require `JWT_SECRET` at startup when `NODE_ENV=production`. Never fall back to `"secret"`.  
  **Where:** `packages/shared/auth.ts`.  
  **Verify:** API fails to start in production if `JWT_SECRET` is unset or default.

---

## 2. API – Error handling and resilience

### 2.1 Central error handler

- [ ] **Gap.** Add Express error-handling middleware (last `app.use((err, req, res, next) => {...})`). Map known errors to HTTP status and `{ error, code? }`. For 5xx: log with logger, return generic `{ error: "Internal server error" }`; no stack in production.  
  **Where:** `apps/api/src/server.ts`; controllers.  
  **Verify:** Thrown error returns consistent JSON; 5xx has no stack in prod.

### 2.2 404 and 405

- [ ] **Gap.** Register 404 handler returning JSON `{ error: "Not found" }` and 405 where applicable.  
  **Where:** `apps/api/src/server.ts`.  
  **Verify:** Unknown route returns JSON 404; unsupported method returns JSON 405.

### 2.3 Logging

- [ ] **Gap.** Introduce structured logger (pino/winston): level from `LOG_LEVEL`, per-request `requestId`, `method`, `path`, `status`, `duration`. Middleware for `requestId`. Replace `console.log(error)` with `logger.error({ err, requestId })`.  
  **Where:** `apps/api/src` (e.g. `tests.controller.ts`, `auth.ts`), new middleware.  
  **Verify:** Logs include requestId; 5xx and auth failures are logged.

---

## 3. API – Input validation and consistency

### 3.1 Request validation

- [ ] **Gap.** Add validation (Zod or express-validator) for: `register`, `login`, create/update `Test`, create/update `Question`, start attempt, submit answer. On failure return 400 with `{ error, details? }`.  
  **Where:** Controllers and/or new validation middleware.  
  **Verify:** Invalid body returns 400 with consistent shape; valid requests pass.

### 3.2 Error response shape

- [ ] **Review.** Standardize on `{ error: string, code?: string }`; align Swagger and central handler.  
  **Where:** Swagger spec, error handler, controllers.

---

## 4. API – Configuration and startup

### 4.1 Env validation at boot

- [ ] **Gap.** At API startup, validate: `DATABASE_URL`, `JWT_SECRET` in production; optional: `NODE_ENV`, `PORT`, `ALLOWED_ORIGINS`. Use Zod (or similar) and `process.exit(1)` with clear message if invalid.  
  **Where:** `apps/api/src/server.ts` (before `app.listen`).  
  **Verify:** Missing/invalid required vars cause exit before listen.

### 4.2 Health check

- [ ] **Gap.** Extend `/health` or add `/health/ready`: **Liveness** — keep current; **Readiness** — `prisma.$queryRaw\`SELECT 1\``; on failure return 503.  
  **Where:** `apps/api/src/server.ts`.  
  **Verify:** DB down → 503 on readiness; liveness still 200.

---

## 5. API – Operational and maintenance

### 5.1 Graceful shutdown

- [ ] **Gap.** On `SIGTERM`/`SIGINT`: `server.close()`, await in-flight (with timeout), disconnect Prisma, `process.exit(0)`.  
  **Where:** `apps/api/src/server.ts`.  
  **Verify:** On SIGTERM, no new connections; in-flight complete or timeout; clean exit.

### 5.2 API docs in production

- [ ] **Review.** Disable or restrict `/api-docs` and `/api-docs.json` in production (by IP or `NODE_ENV`).  
  **Where:** `apps/api/src/server.ts`.

---

## 6. Frontend (admin-dashboard)

### 6.1 Security and CSP

- [ ] **Review.** Add headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, basic CSP.  
  **Where:** `apps/admin-dashboard/next.config.ts` or middleware.

### 6.2 Error boundaries and loading

- [ ] **Gap.** Add route-level `error.tsx`, root `global-error.tsx`, and `loading.tsx` where needed.  
  **Where:** `apps/admin-dashboard`.  
  **Verify:** Errors show friendly UI; loading states during fetch.

### 6.3 Environment and API base URL

- [ ] **Review.** Use `NEXT_PUBLIC_API_URL` for backend. Set in production; must match CORS `ALLOWED_ORIGINS`.  
  **Where:** `apps/admin-dashboard` env and API client.

---

## 7. Database and migrations

### 7.1 Migrations

- [ ] **Review.** In CI/deploy, run `prisma migrate deploy` before starting the API. Never use `db push` in production.  
  **Where:** CI/deploy scripts; `packages/database/prisma/migrations`.

### 7.2 Connection and pooling

- [ ] **Review.** Confirm `DATABASE_URL` and Prisma pooling are suitable for production. Document max connections and any PgBouncer usage.  
  **Where:** `packages/database`, `DATABASE_URL` docs.

---

## 8. Docker and deployment

### 8.1 Dockerfile and env

- [ ] **Review.** Pass `JWT_SECRET`, `DATABASE_URL`, `ALLOWED_ORIGINS`, `NODE_ENV` at runtime (env/secrets), not in image. Prefer `migrate deploy` in entrypoint or init container over `db push`.  
  **Where:** `docker/api.Dockerfile`, `docker/docker-compose.yml`.

### 8.2 Non-root user

- [ ] **Review.** Run API process as non-root in the container.  
  **Where:** `docker/api.Dockerfile`.

### 8.3 Health in compose

- [ ] **Review.** Point liveness/readiness at `GET /health` (and `/health/ready` if added).  
  **Where:** `docker/docker-compose.yml` or K8s manifests.

---

## 9. Observability and documentation

### 9.1 Logging and errors

- [ ] Ensure logs are shipped (stdout is enough if a collector scrapes).  
  **Where:** See 2.3.

### 9.2 OpenAPI / Swagger

- [ ] After central error handling and validation, update Swagger schemas and examples for 4xx/5xx and request/response bodies.  
  **Where:** Swagger config in API.

### 9.3 README and runbooks

- [ ] Document: required env vars, `docker:dev` / `docker:down`, `migrate deploy`, how to run API and admin-dashboard in prod, where to find logs and health.  
  **Where:** `README.md` or `docs/`.

---

## 10. Dependency and build hygiene

### 10.1 Vulnerabilities

- [ ] Run `npm audit` (and `npm audit fix` where safe). Fix or accept critical/high. Enforce in CI.

### 10.2 Lockfile and install

- [ ] Use `npm ci` in Docker and CI. Pin Node version in Dockerfile and/or `.nvmrc`.

### 10.3 Build and type-check

- [ ] CI runs `turbo run build` and `turbo run lint`. Ensure `tsc --noEmit` (or equivalent) for API and frontend.

## 11. Additional works

### 11.1 Resolve all @TODOs

- [ ] Fix all @TODO comments and all todo related codes in other places

---

## Suggested order of work

1. **Env and secrets:** 4.1, 1.5  
2. **Resilience:** 2.1, 2.2, 2.3, 4.2, 5.1  
3. **Security:** 1.1, 1.2, 1.3, 1.5  
4. **Validation:** 3.1, 3.2  
5. **Frontend:** 6.1, 6.2, 6.3  
6. **Deploy and ops:** 7.1, 7.2, 8.1–8.3, 9.3, 10.1–10.3
