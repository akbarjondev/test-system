# Epic 7: Mini App Foundation & Student Auth

Students can open the Mini App from Telegram, authenticate instantly via Telegram identity, and land on a home screen — no passwords, no sign-up. The app is live on Vercel.

### Story 7.1: Mini App Monorepo Scaffold

As a developer,
I want a new `apps/mini-app` workspace bootstrapped in the Turborepo,
So that the team has a working React app foundation to build the Mini App on.

**Acceptance Criteria:**

**Given** the monorepo root
**When** `apps/mini-app` is created
**Then** it is a Vite + React + TypeScript project with Tailwind CSS configured
**And** `@twa-dev/sdk` is installed
**And** `packages/ui` and `packages/types` are added as workspace dependencies
**And** the app is added to `turbo.json` so `npm run dev` and `npm run build` include it
**And** `tg.expand()` is called on mount so the Mini App takes full height in Telegram

**Given** the app runs locally with a tunnel (e.g. ngrok)
**When** opened inside Telegram
**Then** the Telegram Web App JS SDK initializes without errors and `tg.themeParams` CSS variables are applied to the root element

---

### Story 7.2: Telegram initData Auth API Endpoint

As a student,
I want the API to recognize me from my Telegram identity,
So that I can authenticate without entering a username or password.

**Acceptance Criteria:**

**Given** a valid `POST /api/auth/telegram-miniapp` request with `{ initData: string }`
**When** the API processes it
**Then** it validates `initData` using HMAC-SHA256 with `BOT_TOKEN` as the secret key per the Telegram Bot API spec
**And** if the student does not exist, creates a new User with role STUDENT, storing `telegramId` and `fullName` from `initData`
**And** returns `{ token, user: { id, fullName, telegramId } }`

**Given** `initData` was issued more than 24 hours ago
**When** the API validates it
**Then** it returns `{ error: "Auth data expired", code: "INIT_DATA_EXPIRED" }` with status 401

**Given** `initData` signature does not match
**When** the API validates it
**Then** it returns `{ error: "Invalid auth data", code: "INIT_DATA_INVALID" }` with status 401

**Given** a student calls the endpoint a second time
**When** their `telegramId` already exists in the database
**Then** the API finds the existing user and returns a fresh token without creating a duplicate
**And** the Zod schema for this endpoint body is added to `apps/api/src/config/schemas.ts`

---

### Story 7.3: Mini App Auth Flow & Home Screen

As a student,
I want to be silently authenticated when I open the Mini App,
So that I land directly on a home screen without any login form.

**Acceptance Criteria:**

**Given** a student opens the Mini App inside Telegram
**When** the app initializes
**Then** it reads `window.Telegram.WebApp.initData` and calls `POST /api/auth/telegram-miniapp`
**And** the returned JWT is stored in `sessionStorage` (cleared when Telegram closes the app)
**And** the student is shown a home screen displaying their name: "Salom, {fullName}!"

**Given** the auth API returns an error (network failure or invalid initData)
**When** the app handles the response
**Then** it shows a user-friendly error screen in Uzbek: "Autentifikatsiya xatosi. Iltimos qayta urinib ko'ring."
**And** a retry button is visible

**Given** the student is authenticated
**When** the home screen renders
**Then** it shows a "Testlarga o'tish" button that navigates to the tests list screen

---

### Story 7.4: Vercel Deployment & API CORS

As a developer,
I want the Mini App deployed to Vercel and the API configured to accept requests from it,
So that students can access the live app inside Telegram.

**Acceptance Criteria:**

**Given** the `apps/mini-app` Vite build
**When** deployed to Vercel
**Then** the app is served over HTTPS at the assigned Vercel domain

**Given** the Vercel domain is known
**When** `apps/api/src/server.ts` CORS configuration is updated
**Then** the Vercel domain is included in the allowed origins list (read from `MINI_APP_URL` env var)
**And** the env var is documented in `.env.example`

**Given** the Mini App is registered with `@BotFather` as the Mini App URL
**When** a student opens Telegram and taps the bot's menu button (added in Epic 9)
**Then** the Mini App loads correctly at the Vercel URL

---
