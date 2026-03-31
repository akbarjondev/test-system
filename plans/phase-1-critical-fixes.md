# Phase 1 — Critical Fixes

**Goal:** Eliminate all blockers so the app can run end-to-end without crashes or 404s.
**Depends on:** Nothing — this is the foundation.
**Blocks:** All other phases.

---

## Context

The app currently has several broken paths that prevent any real usage:
- Students who log in hit a 404 (`/dashboard/student` doesn't exist, and since students use Telegram, this route should simply redirect or show a friendly page)
- The users API router is commented out, so user management is dead
- The Create Test form's date fields are plain text inputs despite `react-day-picker` being installed
- The API passes raw `req.body` to services with no validation — malformed input can cause unhandled errors
- If `JWT_SECRET` is missing, the app silently uses `"secret"` — a critical security hole in prod

---

## Tasks

### 1.1 — Fix `/dashboard/student` route
**File:** `apps/admin-dashboard/app/dashboard/student/page.tsx` (create)

Since students use Telegram (not the web), this page should:
- Render a simple, friendly page in Uzbek explaining that students use the Telegram bot
- Show the bot link/username
- Not require any data fetching

**Why:** `proxy.ts` redirects `STUDENT` role users to `/dashboard/student`. Without this file, students get a Next.js 404.

---

### 1.2 — Uncomment `usersRoutes` in API server
**File:** `apps/api/src/server.ts`

- Uncomment the `usersRoutes` import and `app.use('/api/users', usersRoutes)` line
- Verify the route file (`apps/api/src/routes/users.ts`) and its controller/service exist and work

---

### 1.3 — Wire date pickers in Create Test form
**File:** `apps/admin-dashboard/app/dashboard/tests/new/ui/FormTest.tsx`

- Replace the plain `<Input type="text">` for `availableFrom` and `availableUntil` with the existing `<Calendar>` / `react-day-picker` component
- Ensure the selected date is correctly passed through `react-hook-form` and serialized to ISO string before submitting to the API
- The toggle for `isAlwaysAvailable` should show/hide these fields (already partially implemented — verify it works)

---

### 1.4 — Add request body validation middleware to API
**Files:** `apps/api/src/middlewares/validate.ts` (create), all route files

- Create a generic `validate(schema: ZodSchema)` Express middleware
- Add Zod schemas for all request bodies: create/update test, create/update question, start attempt, submit answer, register, login
- Apply `validate(schema)` middleware to each relevant route
- Return `400` with a clear error message on validation failure

**Why:** Currently `req.body` is passed directly to services. A missing field causes unhandled exceptions or silent data corruption.

---

### 1.5 — Add startup environment validation
**File:** `apps/api/src/config/env.ts` (create), imported in `apps/api/src/server.ts`

- Use Zod (or a simple manual check) to assert required env vars exist at startup: `JWT_SECRET`, `DATABASE_URL`, `PORT`
- If any are missing, log a clear error and `process.exit(1)`
- `JWT_SECRET` must not equal `"secret"` in production (check `NODE_ENV`)

---

## Definition of Done

- [ ] `npm run dev` starts without errors
- [ ] Admin can log in and reach the dashboard
- [ ] Student who logs in via web sees a friendly "use Telegram" page, not a 404
- [ ] Create Test form date fields use the calendar picker
- [ ] API returns `400` for malformed request bodies instead of `500`
- [ ] Starting the API without `JWT_SECRET` set causes an immediate crash with a clear message
- [ ] `GET /api/users` returns a response (even if empty list)
