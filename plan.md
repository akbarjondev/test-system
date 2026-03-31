# test-system — Master Roadmap

**Project:** Online quiz/test platform. Uzbek-language, educational use.
**Monorepo:** Turborepo — `apps/api` (Express 5), `apps/admin-dashboard` (Next.js 16), `apps/telegram-bot` (student UI), `apps/flutter-student` (mobile student app), `packages/database` (Prisma/PostgreSQL).
**Architecture decision:** Students have two channels — Telegram bot (Phase 3) and Flutter mobile app (Phase 8). No web student portal.

---

## Phase Overview

| # | Phase | Goal | Depends On |
|---|---|---|---|
| 1 | [Critical Fixes](plans/phase-1-critical-fixes.md) | App is minimally functional, no crashes or 404s | — |
| 2 | [Admin Dashboard Completion](plans/phase-2-admin-dashboard.md) | All admin CRUD flows work end-to-end | Phase 1 |
| 3 | [Student Portal via Telegram Bot](plans/phase-3-student-telegram.md) | Students can register, take tests, view results via Telegram | Phase 1 |
| 4 | [API Hardening](plans/phase-4-api-hardening.md) | Backend is production-safe: validation, error handling, security | Phase 1, 2 |
| 5 | [Testing](plans/phase-5-testing.md) | Automated test coverage across API and dashboard | Phase 1–4 |
| 6 | [DevOps & Deployment](plans/phase-6-devops.md) | Full stack containerized and deployed to production | Phase 1–5 |
| 7 | [Polish & Observability](plans/phase-7-polish.md) | Monitoring, cleanup, accessibility, i18n | Phase 6 |
| 8 | [Flutter Student App](plans/phase-8-flutter-app.md) | Native mobile app for students (login, browse, solve tests) | Phase 4, 6 |

---

## Current State (2026-03-31)

- **API core:** solid. Auth, tests, questions, attempts all working.
- **Admin dashboard:** create test + create question working. Edit/delete flows commented out.
- **Student portal:** no web UI. Student 404s after login. Telegram bot is an empty folder.
- **Testing:** zero automated tests, two manual Node.js scripts.
- **Deployment:** only the database runs in Docker. Apps started manually.

---

## Key Constraints

- UI language is Uzbek throughout
- Students have two channels: Telegram bot (Phase 3) and Flutter app (Phase 8)
- Admin dashboard is web-only (Next.js)
- PostgreSQL is the only supported database
