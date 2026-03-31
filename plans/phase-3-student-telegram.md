# Phase 3 — Student Portal via Telegram Bot

**Goal:** Students can register, authenticate, browse tests, take timed tests, and view results — all through Telegram.
**Depends on:** Phase 1 (API validation, working endpoints)
**Blocks:** Phase 5 (bot tests), Phase 6 (deployment)

---

## Context

The Telegram bot is the **sole student-facing UI**. There is no web portal for students. The `apps/telegram-bot` directory exists but is completely empty. Students are identified by their Telegram account and linked to a platform `User` record.

**Chosen library:** [Telegraf](https://telegraf.js.org/) — mature, TypeScript-first, well-suited for conversation-flow bots.

---

## Tasks

### 3.1 — Bootstrap the Telegram bot app
**Files:** `apps/telegram-bot/package.json`, `apps/telegram-bot/tsconfig.json`, `apps/telegram-bot/src/index.ts`

- Initialize the package with `telegraf`, `dotenv`, `@test-system/shared`, `@test-system/database`, `@test-system/types`
- Configure TypeScript (extend from `@test-system/typescript-config`)
- Add `dev` (nodemon + ts-node), `build` (tsc), `start` scripts
- Register in root `turbo.json` pipeline
- Set up `BOT_TOKEN` env var in `.env` and validate at startup (same pattern as Phase 1.5)
- Create a minimal bot that responds to `/start` to verify connectivity

---

### 3.2 — Student authentication flow
**Files:** `apps/telegram-bot/src/auth/`, `apps/api/src/routes/auth.ts`

The bot needs to link a Telegram user to a platform `User` account. Two flows:

**New user (registration):**
1. User sends `/start`
2. Bot asks for email
3. Bot asks for password (twice to confirm)
4. Bot calls `POST /api/auth/register` → creates `STUDENT` account
5. Bot stores the JWT in bot session (see 3.3)
6. Bot confirms registration in Uzbek

**Returning user (login):**
1. User sends `/start` (or any command while unauthenticated)
2. Bot asks: "Ro'yxatdan o'tganmisiz? (Ha / Yo'q)"
3. If yes: ask email + password → `POST /api/auth/login` → store JWT
4. If no: go to registration flow

**Session persistence:**
- Store `{ jwt, userId, email }` per Telegram `chat.id` using `telegraf-session` (or in-memory for MVP, Redis for production)

---

### 3.3 — Session management
**Files:** `apps/telegram-bot/src/middleware/session.ts`

- Use `telegraf`'s built-in session middleware with a file-based or in-memory store for development
- Session shape: `{ jwt: string | null, userId: string | null, email: string | null }`
- Middleware: if `jwt` is present, attach it to context; otherwise redirect to login flow
- JWT expiry handling: if API returns 401, clear session and prompt re-login

---

### 3.4 — Test browsing
**Files:** `apps/telegram-bot/src/scenes/tests-list.ts`

- `/tests` command — lists available tests
- Calls `GET /api/tests` with the student's JWT
- Displays each test as an inline button: `[Test nomi — X daqiqa]`
- Paginate if more than 10 tests (inline "Keyingi ›" / "‹ Oldingi" buttons)
- Tapping a test shows its details: title, description, question count, time limit, and a "Boshlash" (Start) button

---

### 3.5 — Taking a test
**Files:** `apps/telegram-bot/src/scenes/take-test.ts`

This is the core flow. Use Telegraf Scenes (Wizard Scene) to manage multi-step state.

**Flow:**
1. Student taps "Boshlash" on a test → bot calls `POST /api/tests/:testId/attempts/start`
2. Bot retrieves the shuffled question list from the attempt response
3. Bot presents questions one at a time:
   - Question text as message
   - Options as inline keyboard buttons (A, B, C, D)
   - Timer display: "Vaqt: X daqiqa qoldi" shown with each question (calculated client-side from `startedAt` + `timeLimitMinutes`)
4. Student taps an option → bot calls `POST /api/attempts/:attemptId/answers`
5. Bot immediately presents next question
6. On last question, bot shows "Testni yakunlash" (Submit) button
7. Student confirms → bot calls `POST /api/attempts/:attemptId/submit`
8. Bot shows results (see 3.6)

**Time limit enforcement:**
- Before each question, check if time has expired (compare `Date.now()` to `startedAt + timeLimitMinutes * 60000`)
- If expired, auto-submit and notify student
- Set a local `setTimeout` to auto-submit if the student goes idle

**Interrupted session:**
- On `/start` or `/tests`, check `GET /api/tests/:testId/attempts/current`
- If an active attempt exists, offer to continue or abandon

---

### 3.6 — Results display
**Files:** `apps/telegram-bot/src/scenes/results.ts`

After submission, call `GET /api/attempts/:attemptId/results` and display:
- Score: `X / Y ball` (earned / maximum)
- Percentage: `Z%`
- Per-question summary (condensed): question number, ✅ correct / ❌ incorrect / ⬜ skipped
- Option to see full detail: for each question, show the student's answer, correct answer, and explanation if provided

---

### 3.7 — Attempt history
**Files:** `apps/telegram-bot/src/scenes/history.ts`

- `/history` command
- Calls `GET /api/attempts/my-attempts`
- Lists past attempts: test name, date, score, percentage
- Tapping an attempt shows the results detail (reuse 3.6)

---

### 3.8 — Bot commands & help
**Files:** `apps/telegram-bot/src/index.ts`

Register Telegram commands (shown in the "/" menu):
| Command | Description (Uzbek) |
|---|---|
| `/start` | Botni ishga tushirish / Kirish |
| `/tests` | Mavjud testlar ro'yxati |
| `/history` | Mening urinishlarim |
| `/help` | Yordam |
| `/logout` | Chiqish |

- `/help` sends a short guide in Uzbek
- `/logout` clears the session

---

### 3.9 — API additions needed for bot
**File:** `apps/api/src/routes/auth.ts` or new route

The bot needs to know a student's account status by Telegram ID in future iterations, but for MVP the flow above (email/password) is sufficient. However, consider adding:
- `POST /api/auth/telegram-link` — link Telegram `chat.id` to an existing account (future enhancement, not blocking MVP)

For the MVP, standard email+password auth is used.

---

## Definition of Done

- [ ] Bot starts and responds to `/start`
- [ ] New student can register via bot (email + password)
- [ ] Returning student can log in
- [ ] `/tests` shows available tests with pagination
- [ ] Student can take a test question by question
- [ ] Timer is enforced — bot auto-submits on timeout
- [ ] Results are shown immediately after submission
- [ ] `/history` shows past attempts
- [ ] Session persists across bot restarts (file/Redis store)
- [ ] All messages are in Uzbek
