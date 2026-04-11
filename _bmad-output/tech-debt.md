# Technical Debt Backlog

> Items identified during development but deferred for a future session.
> Review this before starting any new epic or sprint planning.

---

## TD-1 — No automated tests for Telegram bot handlers
**Source:** Sprint 1 retrospective (2026-04-09)
**Area:** `apps/telegram-bot/`
**Impact:** All bot flows (onboarding, unlock, test-taking, submit, error handling) require manual verification. Silent regressions are likely as the bot grows.
**Suggested fix:** Add grammY test utilities or integration tests covering the critical flows: `/start` onboarding, test unlock, answer selection, submit with pass/fail outcome.

---

## TD-2 — API pagination cap vs. client-side DataTable mismatch
**Source:** Code review P-D1 (2026-04-09)
**Area:** `apps/api/src/repositories/tests.repository.ts` + `apps/admin-dashboard/app/dashboard/tests/page.tsx`
**Impact:** Admin dashboard fetches `?limit=1000` but `getAllTests` hard-caps at 100. Tests 101+ are silently invisible to teachers with no warning.
**Options:**
- (a) Raise API `getAllTests` cap to 1000 and keep DataTable client-side pagination
- (b) Restore server-side pagination with `searchParams` in the page
**Decision needed:** Pick one approach before the test count grows past 100.

---

## TD-3 — `isAlwaysAvailable: false` + null dates allows unrestricted access
**Source:** Code review W1 (2026-04-09)
**Area:** `apps/api/src/services/attempts.service.ts` — `validateTestAvailability`
**Impact:** When a teacher sets `isAlwaysAvailable = false` but leaves both `availableFrom` and `availableUntil` null, no date restriction fires — the test remains accessible. Pre-existing behavior, not introduced this sprint.
**Suggested fix:** Add a guard: if `isAlwaysAvailable = false` and both dates are null, reject attempt start with a meaningful error or treat as "not yet scheduled."

---

## TD-4 — Race condition on `allowOnlyOneAttempt` (double-tap)
**Source:** Code review W2 (2026-04-09)
**Area:** `apps/api/src/services/attempts.service.ts` — `startTest`
**Impact:** Two simultaneous `POST /api/tests/:testId/attempts/start` requests from the same student can both pass the completed-attempt check before either creates a record, resulting in two attempts for a "one-attempt" test.
**Suggested fix:** DB-level unique constraint on `(testId, studentId)` when `allowOnlyOneAttempt = true`, or wrap the check+create in a Prisma transaction with a unique violation handler.

---

## TD-5 — `testPassword` brute-force enumeration
**Source:** Code review W3 (2026-04-09)
**Area:** `apps/api/src/routes/tests.ts` — `POST /api/tests/unlock`
**Impact:** Only 1000 possible 3-digit codes. Global rate-limit (100 req/min) allows full enumeration in ~10 minutes. Any test password can be cracked trivially.
**Suggested fix:** Add per-endpoint rate limiting on `/unlock` (e.g., 5 attempts/min per IP or per student), or increase code entropy (4–6 digits / alphanumeric).
