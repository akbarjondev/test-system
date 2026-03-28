# Codebase Review: test-system
> Reviewed: 2026-03-24

## Executive Summary

A full-stack online quiz/test platform built as a Turborepo monorepo with an Express 5 API, Next.js 15 admin dashboard, and PostgreSQL via Prisma. The architecture is solid and well-organized, but the project has several incomplete features, security concerns, and testing gaps that should be addressed before production use.

**Overall rating: 6/10** — good structural foundation, needs polish and completion.

---

## Architecture Overview

```
test-system/
  apps/
    api/              # Express 5 REST API (port 5000)
    admin-dashboard/  # Next.js 15 admin UI (port 3000)
    telegram-bot/     # Empty placeholder
  packages/
    database/         # Prisma ORM (PostgreSQL)
    shared/           # JWT + bcrypt auth utilities
    types/            # Shared TypeScript interfaces
    ui/               # Stub component library (unused)
    eslint-config/
    typescript-config/
```

The layered API pattern (Routes → Controllers → Services → Repositories → Prisma) is clean and follows separation of concerns well. The monorepo setup with Turborepo is appropriate for this scale.

---

## Strengths

### 1. Clean Architecture
- Layered API pattern is consistent and predictable
- Shared packages (`types`, `shared`, `database`) avoid code duplication across apps
- TypeScript throughout with strict mode enabled

### 2. Security Basics in Place
- `helmet` for HTTP security headers
- `cors` middleware configured
- `express-rate-limit` (100 req/min per IP)
- `bcryptjs` (10 rounds) for password hashing
- JWT-based auth with 7-day expiry
- Role-based access control (ADMIN vs STUDENT)

### 3. Good API Design
- RESTful endpoints with proper HTTP methods
- Pagination on the tests list endpoint (`?page=N&limit=N`)
- Swagger/OpenAPI docs at `/api-docs`
- Question shuffling on test start for anti-cheating
- Test scheduling support (`availableFrom`/`availableUntil`)

### 4. Frontend Quality
- Next.js App Router with server actions — modern pattern
- `react-hook-form` + `zod` for form validation
- Route protection middleware logic (`proxy.ts`)
- Proper cookie handling (httpOnly, 7-day expiry)
- Responsive UI with shadcn-style components

---

## Issues and Recommendations

### CRITICAL

#### 1. Credentials Committed to Repository
**Files affected**: `apps/api/.env`, `packages/database/.env`, `apps/admin-dashboard/.env.local`

The `.env` files contain real-looking credentials and are not listed in `.gitignore` (or the gitignore is not excluding them). This is a serious security risk.

```
# apps/api/.env — SHOULD NOT be in git
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/testdb
```

**Fix**: Add all `.env*` (except `.env.example`) to `.gitignore`, rotate any exposed secrets, and provide `.env.example` files with placeholder values.

#### 2. Next.js Middleware Not Wired
**File**: `apps/admin-dashboard/proxy.ts`

Route protection logic exists in `proxy.ts` but Next.js requires the file to be named `middleware.ts` at the app root. As-is, **all routes are unprotected** — unauthenticated users can access the dashboard.

```bash
# Fix: rename the file
mv apps/admin-dashboard/proxy.ts apps/admin-dashboard/middleware.ts
```

#### 3. Create Test Form Not Functional
**File**: `apps/admin-dashboard/app/dashboard/tests/new/ui/FormTest.tsx`

The submit handler only logs to console — the server action call is commented out:
```ts
// const response = await createTest(data)  // ← never called
console.log(data)
```
There is also no `createTest` server action file. The core admin feature (creating tests) does not work.

---

### HIGH PRIORITY

#### 4. No Automated Tests
There is no test framework configured anywhere in the project. The only tests are two manual Node.js scripts (`test-endpoints.js`, `test-attempts.js`) that require a running server.

**Recommendation**: Add Vitest (or Jest) to the API package and testing-library to the frontend. At minimum, unit test the services layer and form validation schemas.

#### 5. Database Migration Drift
The Prisma schema has evolved (added `timeLimitMinutes`, `isAlwaysAvailable`, `availableFrom`, `availableUntil`, renamed `pointsPerQuestion`) beyond the single initial migration. This means `prisma migrate deploy` in production will fail or produce incorrect results.

**Fix**:
```bash
npx prisma migrate dev --name add_scheduling_and_time_limit
```
Run this and commit the resulting migration file.

#### 6. CORS Allows All Origins
`cors()` with no `origin` option allows requests from any domain. In production this should be restricted.

```ts
// apps/api/src/server.ts
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
  credentials: true,
}));
```

#### 7. No Admin Creation Flow
`UsersController.registerUser` hardcodes `role = "STUDENT"`. There is no way to create an ADMIN user through the API. Currently admins must be seeded directly in the database, which is not documented anywhere.

**Fix**: Add either a seeding script (`prisma/seed.ts`) or a protected admin-creation endpoint, and document the bootstrap process.

---

### MEDIUM PRIORITY

#### 8. Static Class Pattern Limits Testability
All controllers, services, and repositories are static classes:
```ts
class TestsController {
  static async getTests(req, res) { ... }
}
```
This makes dependency injection and mocking difficult. Consider either:
- Plain exported functions, or
- Regular class instances with constructor injection

#### 9. Redundant Date Libraries
Both `dayjs` and `date-fns` are installed in the admin dashboard. These serve the same purpose. Pick one and remove the other. `date-fns` is already used with `react-day-picker` so remove `dayjs`.

#### 10. `packages/ui` Is a Dead Stub
The `@repo/ui` package is the unmodified Turborepo starter template with a single `<Button>` component. The admin dashboard has its own `/components/ui/` folder. Either build out this shared library or remove it to reduce confusion.

#### 11. `availableFrom`/`availableUntil` Uses Plain Input
**File**: `apps/admin-dashboard/app/dashboard/tests/new/ui/FormTest.tsx`

`react-day-picker` and `calendar.tsx` are installed but the date fields use `<Input type="text">`. Wire up the `Calendar` component for a proper date picker experience.

#### 12. JWT Secret is a Placeholder
`JWT_SECRET=your-super-secret-jwt-key` in the committed `.env` file. Even as a default this is dangerous. The shared package should throw at startup if `JWT_SECRET` is not set or equals the placeholder value.

#### 13. Missing Input Validation on API
The API controllers call service methods directly from `req.body` with minimal validation. There is no request body schema validation middleware (e.g., Zod, Joi, express-validator). Invalid/malformed payloads could cause unhandled errors.

**Fix**: Add Zod schemas (reusing `@test-system/types` where possible) and validate `req.body` before passing to services.

---

### LOW PRIORITY

#### 14. No CI/CD Pipeline
No GitHub Actions, GitLab CI, or similar. Add at minimum:
- Lint check
- Type check (`tsc --noEmit`)
- Run test suites

#### 15. Student Dashboard Missing
`ROUTES.STUDENT_DASHBOARD = "/dashboard/student"` is defined and the middleware redirects students there, but the page does not exist. Students who log in hit a 404.

#### 16. Telegram Bot is Empty
`apps/telegram-bot` is a placeholder. Either scaffold it or remove it from the monorepo to avoid confusion.

#### 17. `usersRoutes` Commented Out
In `server.ts`, `app.use("/api/users", usersRoutes)` is commented out and the route file doesn't exist. This dead reference should be removed until the feature is built.

#### 18. Error Response Format Inconsistency
Some error responses return `{ message: "..." }`, others return `{ error: "..." }`. Standardize to one format across all endpoints.

---

## Dependency Audit

| Issue | Dependency | Recommendation |
|-------|-----------|----------------|
| Duplicate date lib | `dayjs` | Remove, keep `date-fns` |
| Unused UI package | `@repo/ui` | Build out or remove |
| `dotenv` version | `^17.2.3` (very new) | Verify compatibility |
| Next.js `16.1.1` | Very new release | Verify stability |

---

## Missing Features Checklist

- [ ] `createTest` server action
- [ ] Admin dashboard: edit test
- [ ] Admin dashboard: delete test
- [ ] Student dashboard (`/dashboard/student`)
- [ ] Admin creation / seeding script
- [ ] Input validation middleware (API)
- [ ] Wire `middleware.ts` for route protection
- [ ] Automated tests (unit + integration)
- [ ] Date picker UI for scheduling fields
- [ ] CI/CD pipeline
- [ ] Telegram bot

---

## Quick Wins (Do These First)

1. **Rename `proxy.ts` → `middleware.ts`** — 1 minute, fixes auth bypass
2. **Add `.env*` to `.gitignore`** — 1 minute, fixes credential exposure
3. **Implement `createTest` server action** — the core admin workflow is broken
4. **Add `prisma migrate dev`** — fix migration drift before it becomes a production blocker
5. **Remove `dayjs`** — `npm uninstall dayjs` in admin-dashboard

---

## Conclusion

The project has a well-thought-out data model, clean API layering, and a modern frontend stack. The biggest risks right now are the unenforced route protection (middleware not wired), the non-functional create-test form, and the committed credentials. Addressing the **CRITICAL** items listed above should be the immediate focus before any further feature development.
