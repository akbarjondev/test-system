# Telegram Mini App — Requirements Inventory

> **Context:** Epics 7–9 cover the Telegram Mini App (TWA) for students. This is a temporary bridge client before the Flutter app — deployed to Vercel, running inside Telegram's in-app browser. Existing bot flows remain unchanged.

### Functional Requirements (Mini App)

FR-MA1: A new `apps/mini-app` workspace must be scaffolded with Vite + React + TypeScript + Tailwind CSS within the existing Turborepo monorepo.
FR-MA2: The `@twa-dev/sdk` package must be integrated to access the Telegram Web App JS SDK (theme params, back button, viewport, etc.).
FR-MA3: Student must authenticate using Telegram's `initData` payload — no email or password required.
FR-MA4: API must expose a new endpoint `POST /api/auth/telegram-miniapp` that validates `initData` via HMAC-SHA256, auto-registers the student if not already registered, and returns a JWT with STUDENT role.
FR-MA5: Student can view a list of available/accessible tests in the Mini App.
FR-MA6: Student can enter a test unlock code in the Mini App when the test requires one.
FR-MA7: Student can start a test attempt, answer questions one at a time, and submit through the Mini App UI.
FR-MA8: Student can view their result (score, pass/fail status) immediately after submission.
FR-MA9: Telegram bot must expose a Menu Button (configured via @BotFather) that opens the Mini App Vercel URL.
FR-MA10: Mini App must be deployed to Vercel with HTTPS (required by Telegram for Mini Apps).
FR-MA11: Mini App must apply Telegram's native color theme using CSS variables from `tg.themeParams` so the UI blends with the user's Telegram theme.
FR-MA12: Mini App must handle Telegram's native Back Button for in-app navigation between screens.

### Non-Functional Requirements (Mini App)

NFR-MA1: `initData` validation must use HMAC-SHA256 per the Telegram Bot API specification — no raw trust of client-sent user data.
NFR-MA2: JWT issued from `initData` auth must carry STUDENT role and must not grant dashboard or admin access.
NFR-MA3: The Mini App must be responsive and function correctly inside Telegram's in-app browser on Android and iOS.
NFR-MA4: API CORS configuration must whitelist the Vercel production domain.
NFR-MA5: No `console.log` in committed code; TypeScript strict mode throughout.
NFR-MA6: Existing Telegram bot conversation flows must remain fully functional after the menu button is added.
NFR-MA7: Telegram `initData` has a 24-hour expiry — the API must reject expired payloads with a clear error.

### Additional Requirements (Architecture — Mini App)

- `apps/mini-app` is a standalone Vite app in the Turborepo monorepo; no SSR or Next.js needed.
- New Zod schema for `initData` validation body goes in `apps/api/src/config/schemas.ts` — not inline in the route file.
- The new auth endpoint follows the existing middleware chain: `validate(schema) → Controller → Service → Prisma`.
- `packages/ui` (shadcn components) and `packages/types` can be reused in `apps/mini-app`.
- Bot menu button URL must point to the Vercel production URL; local dev uses a tunnel (e.g. ngrok) for testing.
- No new student-facing pages in `apps/admin-dashboard` — Mini App is a separate app entirely.

### FR Coverage Map (Mini App)

FR-MA1: Epic 7 — Scaffold apps/mini-app with Vite + React + TS + Tailwind
FR-MA2: Epic 7 — Integrate @twa-dev/sdk and Telegram theme
FR-MA3: Epic 7 — Student auth via initData (no password)
FR-MA4: Epic 7 — New API endpoint POST /api/auth/telegram-miniapp
FR-MA5: Epic 8 — Tests list screen in Mini App
FR-MA6: Epic 8 — Test unlock code entry in Mini App
FR-MA7: Epic 8 — Test-taking screen (questions + answers + submit)
FR-MA8: Epic 8 — Results screen after submission
FR-MA9: Epic 9 — Bot menu button pointing to Mini App
FR-MA10: Epic 7 — Vercel deployment + HTTPS
FR-MA11: Epic 7 — Telegram theme integration via tg.themeParams
FR-MA12: Epic 8 — Telegram Back Button handling in-app navigation
NFR-MA1: Epic 7 — HMAC-SHA256 initData validation in API service
NFR-MA4: Epic 7 — CORS whitelist for Vercel domain
NFR-MA6: Epic 9 — Bot menu button added without breaking existing flows
