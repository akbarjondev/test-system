# Sprint Retrospective — Epics 1–5 (Full Sprint)
**Date:** 2026-04-09
**Facilitator:** Bob (Scrum Master)
**Project Lead:** Akbar
**Scope:** All 20 stories across Epics 1–5

---

## Sprint Summary

| Epic | Title | Stories |
|------|-------|---------|
| E1 | Simplified Student Onboarding | 4/4 ✅ |
| E2 | Test Access Control | 4/4 ✅ |
| E3 | Reliable Test-Taking Experience | 2/2 ✅ |
| E4 | Pass Threshold & Results | 5/5 ✅ |
| E5 | Teacher Dashboard Overhaul | 5/5 ✅ |

**Total:** 20 stories delivered | Code review completed 2026-04-09 | All 17 patches applied | 2 architectural decisions resolved

---

## What Went Well

- **Speed of delivery** — All 5 epics completed in a single sprint. Velocity was high throughout.
- **Schema-first story design** — Isolating migration stories (2.1, 4.1) before API/UI work eliminated schema regressions. Zero rollbacks.
- **Epic sequencing** — Onboarding → Access Control → Experience → Results → Dashboard flowed naturally, each epic building cleanly on the previous.
- **shadcn DataTable reuse** — Component introduced in Story 5.1 was reused across all list views without rework.
- **Code review process** — Three-layer review caught a critical silent bug (P1: `passed` field never returned) before production, plus 16 other fixes.

## What Could Be Improved

- **Bot testing gap** — No automated tests for any bot handler. Manual-only verification is not sustainable.
- **API/client contract drift** — The bot read `result.passed` but the API never returned it. Caught only in code review, not during development. Shared TypeScript types across `packages/types` should prevent this.
- **NFR compliance during dev** — `console.log` violations (NFR5) appeared in ~6 places in `attempts.controller.ts`. Should be caught by linting pre-commit, not code review.
- **API cap vs. client pagination mismatch** — A teacher with 100+ tests would silently lose data. No warning, no error.

## Action Items

| # | Action | Area |
|---|--------|------|
| A1 | Add per-endpoint rate limiting on `POST /api/tests/unlock` | API |
| A2 | Decide server-side vs. client-side pagination for test list | API + Dashboard |
| A3 | Add bot integration tests for critical flows | Telegram bot |
| A4 | Enforce `console.log` ban via ESLint rule or pre-commit hook | Dev tooling |

## Technical Debt Saved

All deferred items logged in `_bmad-output/tech-debt.md` (TD-1 through TD-5).

## Next Steps

- Phase 4: Production deployment on Railway (see `artifacts/deployment.md`)
- Flutter mobile app for students (Epic 6 — planned)
- Telegram bot webhook mode for production (Epic 6 — planned)
