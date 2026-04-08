# Phase 5 — Testing

**Goal:** Automated test coverage across API services, routes, and critical dashboard flows. Replace manual scripts.
**Depends on:** Phase 1–4 (stable, hardened codebase to test against)
**Blocks:** Phase 6 (CI/CD pipeline runs tests)

---

## Context

Currently there are zero automated tests. Two manual Node.js scripts (`test-endpoints.js`, `test-attempts.js`) exist but are brittle and not part of any CI pipeline. The static class pattern used throughout the API makes unit testing hard — integration tests against a real test database are more practical and reliable.

**Testing strategy:**
- **API:** Integration tests using a real PostgreSQL test database (not mocked). Spin up via Docker/Podman in CI.
- **Admin Dashboard:** Unit tests for server actions and utility functions. E2E with Playwright for critical UI flows.
- **Telegram Bot:** Unit tests for message handlers and scene logic (mock the Telegram API).

**Framework:** Vitest (fast, TypeScript-native, ESM-compatible, monorepo-friendly).

---

## Tasks

### 5.1 — Configure Vitest in the monorepo
**Files:** `vitest.config.ts` (root), per-app `vitest.config.ts`, root `package.json`

- Install `vitest` and `@vitest/coverage-v8` at the root
- Create root `vitest.workspace.ts` that includes `apps/api`, `apps/admin-dashboard`, `apps/telegram-bot`
- Add `"test": "vitest run"` and `"test:watch": "vitest"` to root `package.json` and each app
- Add `"test:coverage": "vitest run --coverage"` for CI
- Configure path aliases in each vitest config to match `tsconfig.json` paths

---

### 5.2 — API: test database setup
**Files:** `apps/api/src/test/setup.ts` (create), `apps/api/src/test/helpers.ts` (create)

- Use a separate `TEST_DATABASE_URL` env var pointing to a test database
- `setup.ts`: run `prisma migrate deploy` before all tests, truncate all tables before each test suite
- `helpers.ts`: factory functions to create test data (users, tests, questions, attempts)
- Seed an admin user and a student user for auth tests

---

### 5.3 — API: authentication tests
**File:** `apps/api/src/routes/__tests__/auth.test.ts`

Cover:
- `POST /api/auth/register` — success, duplicate email (409), missing fields (400)
- `POST /api/auth/login` — success (returns JWT), wrong password (401), unknown email (401)
- JWT token can be decoded and verified with `verifyToken`

---

### 5.4 — API: tests CRUD integration tests
**File:** `apps/api/src/routes/__tests__/tests.test.ts`

Cover:
- Create test (admin only — 403 for student)
- List tests — admin sees all, student sees only attempted
- Get test by ID — includes questions and options
- Update test — only owner or admin
- Delete test — cascades to questions/options/attempts

---

### 5.5 — API: questions CRUD integration tests
**File:** `apps/api/src/routes/__tests__/questions.test.ts`

Cover:
- Create question with options
- List questions for a test
- Update question (text + options)
- Delete question — cascades to options/answers

---

### 5.6 — API: attempt lifecycle integration tests
**File:** `apps/api/src/routes/__tests__/attempts.test.ts`

Cover:
- Start attempt — shuffled question order, cannot start twice
- Get current attempt — returns questions in shuffled order
- Submit answer — updates answer, handles re-submission
- Time limit enforcement — submitting after expiry returns error or auto-submits
- Submit test — calculates score correctly (all correct, some correct, none correct)
- Get results — only accessible after submission
- My attempts — returns only the student's own attempts

---

### 5.7 — Admin Dashboard: server action unit tests
**Files:** `apps/admin-dashboard/actions/__tests__/tests.test.ts`, `questions.test.ts`, `auth.test.ts`

- Mock `fetch` (or use `msw` for more realistic mocking)
- Test `createTest`, `updateTest`, `deleteTest` server actions:
  - Happy path: API call made with correct payload, redirect triggered
  - API error: toast error returned, no redirect
- Test `createQuestion`, `updateQuestion`, `deleteQuestion`
- Test `login`, `logout` auth actions

---

### 5.8 — Admin Dashboard: E2E tests with Playwright
**Files:** `apps/admin-dashboard/e2e/` (create), `playwright.config.ts`

Cover the critical happy paths:
1. Login as admin → see dashboard
2. Create a test → redirected to test detail
3. Add a question with 4 options → question appears in list
4. Edit test title → updated in list
5. Delete test → removed from list

- Use a seeded test database (same as API tests)
- Run against `next dev` or `next start` in CI

---

### 5.9 — Telegram Bot: handler unit tests
**Files:** `apps/telegram-bot/src/__tests__/`

- Mock the Telegraf context (`ctx`) object
- Test each command handler in isolation:
  - `/start` — unauthenticated: prompts login/register; authenticated: shows menu
  - `/tests` — calls API, formats response correctly
  - Answer submission handler — calls correct API endpoint, advances to next question
  - Timer expiry handler — auto-submits attempt
- Test auth flow state machine (registration and login steps)

---

### 5.10 — Remove manual test scripts
**Files:** `apps/api/test-endpoints.js`, `apps/api/test-attempts.js`

- Once automated tests cover the same scenarios, delete these files
- Remove any `package.json` scripts that reference them

---

## Definition of Done

- [ ] `npm test` runs all tests and passes with green output
- [ ] API integration tests cover auth, tests, questions, and full attempt lifecycle
- [ ] Dashboard server actions have unit test coverage
- [ ] Playwright E2E covers the 5 critical admin flows
- [ ] Bot handlers have unit test coverage
- [ ] Code coverage report generated (target: >70% for API services)
- [ ] Manual test scripts deleted
