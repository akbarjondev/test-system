# Phase 4 — API Hardening

**Goal:** The API is production-safe: consistent error handling, security hardening, structured logging, and clean shutdown.
**Depends on:** Phase 1 (body validation already in place), Phase 2 (all routes exist)
**Blocks:** Phase 6 (deployment)

---

## Context

The API works but has several production-unsafe patterns: wildcard CORS, mixed error response formats, no structured logging, no graceful shutdown, and Swagger UI exposed in production. This phase makes the API ready for real traffic.

---

## Tasks

### 4.1 — Restrict CORS
**File:** `apps/api/src/server.ts`

- Replace `cors()` (allow all) with explicit origin allowlist
- Read allowed origins from env var `CORS_ORIGINS` (comma-separated): `http://localhost:3000,https://admin.yourdomain.com`
- Apply `credentials: true` for cookie-based flows if needed
- Return `403` for disallowed origins

---

### 4.2 — Centralized error handler middleware
**File:** `apps/api/src/middlewares/error-handler.ts` (create), `apps/api/src/server.ts`

- Create a single Express error handler `(err, req, res, next)` registered last in `server.ts`
- Distinguish error types:
  - `ZodError` → 400 with field-level messages
  - `PrismaClientKnownRequestError` → map common codes (P2002 unique, P2025 not found) to 409/404
  - Custom `AppError` class (create in `types/`) with `statusCode` and `message`
  - Unhandled → 500 with generic message (never leak stack traces in production)
- All error responses use consistent shape: `{ error: string, details?: unknown }`

---

### 4.3 — Normalize all error response formats
**Files:** All controllers in `apps/api/src/controllers/`

- Audit every `res.json({ message: ... })` error response and change to `{ error: ... }`
- Remove inline try-catch from controllers that duplicate error handling — let errors propagate to the centralized handler via `next(err)`
- Ensure all `404` responses use `{ error: "Not found" }` and all `401` use `{ error: "Unauthorized" }`

---

### 4.4 — Graceful shutdown
**File:** `apps/api/src/server.ts`

- Listen for `SIGTERM` and `SIGINT`
- On signal: stop accepting new connections, wait for in-flight requests to finish (with a 10s timeout), then close the Prisma client and exit cleanly
- Log "Server shutting down..." on signal receipt

---

### 4.5 — Structured logging
**Files:** `apps/api/src/config/logger.ts` (create), replace all `console.log` calls

- Install `pino` and `pino-http`
- Create a singleton logger instance
- Replace all `console.log` / `console.error` with `logger.info` / `logger.error`
- Add `pino-http` as request logging middleware (replaces manual request logs)
- In production (`NODE_ENV=production`), output JSON; in development, use `pino-pretty`

---

### 4.6 — Restrict Swagger UI in production
**File:** `apps/api/src/server.ts`

- Wrap Swagger route registration in `if (process.env.NODE_ENV !== 'production')`
- Or protect it behind the `verifyAdminMiddleware` in production
- Keep JSON spec (`/api-docs.json`) accessible in all environments (useful for client code generation)

---

### 4.7 — User management API endpoints
**Files:** `apps/api/src/routes/users.ts`, `apps/api/src/controllers/users.ts`, `apps/api/src/services/users.ts`

Ensure these endpoints exist and work (required by Phase 2.5):
- `GET /api/users` — list all users (ADMIN only), with pagination
- `GET /api/users/:userId` — get user by ID (ADMIN only)
- `PUT /api/users/:userId` — update user role (ADMIN only)
- `DELETE /api/users/:userId` — delete user (ADMIN only, cannot delete self)

Apply `verifyAdminMiddleware` to all user management routes.

---

### 4.8 — Add API-level rate limiting per route
**File:** `apps/api/src/middlewares/rate-limit.ts` (extend existing)

- The global 100 req/min limiter is already in place
- Add stricter limits on auth routes:
  - `POST /api/auth/login` → 10 req/min per IP (brute-force protection)
  - `POST /api/auth/register` → 5 req/min per IP

---

## Definition of Done

- [ ] CORS rejects requests from non-allowlisted origins
- [ ] All API errors use `{ error: string }` shape consistently
- [ ] Unhandled exceptions return 500 without leaking stack traces
- [ ] `SIGTERM` causes graceful shutdown within 10 seconds
- [ ] All log output is structured JSON in production
- [ ] Swagger UI is not accessible in production (or is admin-protected)
- [ ] `GET /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` all work
- [ ] Auth routes have stricter rate limits than global
