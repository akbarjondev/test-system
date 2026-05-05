---
stepsCompleted: ["step-01", "step-02", "step-03", "step-04", "step-01-epic6", "step-02-epic6", "step-03-epic6", "step-04-epic6", "step-01-miniapp", "step-02-miniapp", "step-03-miniapp", "step-04-miniapp"]
inputDocuments:
  - "artifacts/architecture.md"
  - "artifacts/data-model.md"
  - "artifacts/api-reference.md"
  - "user task list (session input)"
  - "_bmad-output/design-system/design-system.md"
  - "_bmad-output/design-system/design-system-tasks.md"
  - "_bmad-output/planning-artifacts/prd.md"
  - "session input (Telegram Mini App scope)"
---

# test-system - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for test-system, decomposing requirements from the user task list, architecture, and data model into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Dashboard UI must be updated to use shadcn/ui components with a teacher-friendly layout designed for users with limited digital literacy
FR2: Test model must include an optional `passingScore` (Float?) field representing the minimum score required to pass a test
FR3: API create/update test endpoints must accept and persist `passingScore`
FR4: Dashboard test creation and edit forms must include a `passingScore` input field
FR5: Test results view must display whether each student passed or failed based on `passingScore` (when set)
FR6: Test model must include an `allowOnlyOneAttempt` (Boolean, default false) field
FR7: API must enforce the one-attempt rule when `allowOnlyOneAttempt` is true — reject attempt start if student already has a completed attempt for that test
FR8: API submit endpoint must check whether the time limit has been exceeded (now > startedAt + timeLimitMinutes) and auto-submit or reject accordingly
FR9: Bot must catch all Telegram API errors globally and never crash — errors must be logged and the bot must continue running
FR10: Bot must delete the previous login/register message and inline keyboard after successful authentication
FR11: Bot must display the selected answer as plain text below the question after selection, and remove the inline answer keyboard
FR12: Student authentication in the bot must use Telegram user ID (ctx.from.id) for auto-registration — no email or password required
FR13: `globals.css` must define `--success`, `--error`, `--warning` tokens (+ `*-foreground` variants) with light and dark mode values, mapped in `@theme inline`
FR14: `Badge` component `success`, `error`, and `warning` variants must reference semantic CSS tokens — no hardcoded Tailwind palette classes
FR15: Dashboard home `StatCard` must use `<Card>` + `<CardContent>` components; warning state uses `border-warning` / `text-warning` token classes
FR16: All secondary/helper text across dashboard pages must use `text-muted-foreground`; no `text-gray-500`, `text-zinc-500`, or `text-zinc-400`
FR17: All `<Table>` instances on dashboard pages must be wrapped in a `rounded-xl border border-border overflow-hidden bg-card` container div
FR18: Pass/fail status in the dashboard recent attempts table must use `<Badge variant="success">` / `<Badge variant="error">`
FR19: User role column in students page must use `<Badge variant="default">` (Admin) and `<Badge variant="secondary">` (Student)
FR20: Students page `<Table>` must be wrapped in the standard styled container div
FR21: Question option correct/incorrect indicators in test detail page must use `text-success` / `text-error` token classes
FR22: Students page and Tests list page must each have a subtitle `<p className="text-sm text-muted-foreground mt-1">` below the H1

### Non-Functional Requirements

NFR1: All new API routes must follow the existing middleware chain: validate(schema) → verifyToken → Controller → Service → Repository → Prisma
NFR2: All new Zod schemas must be added to apps/api/src/config/schemas.ts — never inline in route files
NFR3: No raw SQL — Prisma only for all data access
NFR4: TypeScript strict mode must be maintained across all files
NFR5: No console.log in committed code
NFR6: All API error responses must use format { error: string, code?: string }
NFR7: Bot error handling must use grammY's built-in error boundary (bot.catch) plus try/catch in individual handlers
NFR8: Dashboard language and labels must remain accessible for Uzbek-speaking teachers with limited platform experience

### Additional Requirements

- Bot auto-registration via Telegram identity requires either: (a) storing telegramId on the User model, or (b) creating a TelegramUser mapping table. Decision needed before implementation.
- Time limit enforcement: TestAttempt.startedAt already exists in schema; submit endpoint needs to compute startedAt + timeLimitMinutes and compare to current timestamp.
- allowOnlyOneAttempt enforcement: service layer must query for existing completed attempts (submittedAt IS NOT NULL) for the same testId + studentId before allowing attempt start.
- passingScore: optional Float field on Test model; does not affect scoring logic, only result display and pass/fail determination.
- All existing cascade delete rules (Test → Question → Option/QuestionOrder/Answer, TestAttempt → QuestionOrder/Answer) must be preserved in any schema migrations.
- BotSession table already exists in schema for grammY session storage.

### UX Design Requirements

UX-DR1: All list views (tests, users, results) must use shadcn DataTable component with sorting and pagination
UX-DR2: Test creation form must use clear, labeled sections with helper text for each field
UX-DR3: Pass/fail status in results must use a visible badge (green/red) — not just a number
UX-DR4: Navigation must be minimal and flat — teachers should reach any page in 2 clicks maximum
UX-DR5: Bot messages must be concise and in the local language — avoid technical jargon
UX-DR6: Color token system must be fully semantic — all status colors flow through CSS variables, enabling theme changes from `globals.css` alone
UX-DR7: `Badge` component is the sole pattern for status and role indicators across the dashboard — no inline colored `<span>` elements
UX-DR8: `Card` component is the sole pattern for card/panel surfaces — no raw `<div>` with hardcoded bg/border color classes
UX-DR9: All list-page tables must be visually contained in a consistent rounded border wrapper
UX-DR10: All dashboard list pages must have a subtitle under H1 for consistent page structure

### FR Coverage Map

FR13: Epic 6 — Add `--success`, `--error`, `--warning` CSS tokens to globals.css
FR14: Epic 6 — Migrate Badge success/error/warning variants to semantic tokens
FR15: Epic 6 — Refactor StatCard to use Card component with token classes
FR16: Epic 6 — Replace all hardcoded gray text classes with `text-muted-foreground`
FR17: Epic 6 — Wrap all dashboard Tables in `border-border bg-card` container
FR18: Epic 6 — Replace inline pass/fail spans with Badge variant components
FR19: Epic 6 — Replace hardcoded role colors with Badge variants in students page
FR20: Epic 6 — Add styled table wrapper to students page
FR21: Epic 6 — Migrate question option colors to `text-success` / `text-error` tokens
FR22: Epic 6 — Add subtitle `<p>` under H1 on Students and Tests list pages
UX-DR6: Epic 6 — Semantic color token system in globals.css
UX-DR7: Epic 6 — Badge as sole status/role indicator pattern
UX-DR8: Epic 6 — Card as sole card surface pattern
UX-DR9: Epic 6 — Consistent table wrapper on all list pages
UX-DR10: Epic 6 — Subtitle under H1 on all list pages
FR1: Epic 5 — Dashboard UI overhaul with shadcn/ui components
FR2: Epic 4 — passingScore field added to Test schema
FR3: Epic 4 — passingScore accepted in API create/update endpoints
FR4: Epic 4 — passingScore input field in dashboard test form
FR5: Epic 4 — Pass/fail badge in dashboard results and bot message
FR6: Epic 2 — allowOnlyOneAttempt field added to Test schema
FR7: Epic 2 — One-attempt enforcement in API + bot shows previous score
FR8: Epic 3 + 4 — Time limit block on submit (E3), timedOutAt schema + dashboard status (E4)
FR9: Epic 1 — Bot global error handling via bot.catch + try/catch
FR10: Epic 1 — Delete old auth messages after successful login/register
FR11: Epic 3 — Show selected answer text, remove inline keyboard
FR12: Epic 1 — Telegram identity auto-registration (telegramId + phone + fullName)
FR-E2-password: Epic 2 — testPassword on Test schema + unlock API endpoint + bot flow
NFR8: Epic 5 — All user-facing text in Uzbek language

## Epic List

### Epic 1: Simplified Student Onboarding
Students can start using the bot instantly — no email or password. Telegram identity and phone number is all they need. The bot never crashes due to Telegram API errors.
**FRs covered:** FR9, FR10, FR12

### Epic 2: Test Access Control
Teachers control test access via a 3-digit code. Students unlock tests with the code, and the system enforces one-attempt rules with friendly feedback.
**FRs covered:** FR6, FR7, FR-E2-password

### Epic 3: Reliable Test-Taking Experience
Students have a clean, distraction-free test experience with clear answer confirmation and time limit awareness.
**FRs covered:** FR8 (bot + API enforcement), FR11

### Epic 4: Pass Threshold & Results
Teachers set minimum passing scores. Both teacher and student see meaningful pass/fail results. Timed-out attempts are visible in the dashboard.
**FRs covered:** FR2, FR3, FR4, FR5, FR8 (timedOutAt schema + dashboard display)

### Epic 5: Teacher Dashboard Overhaul
Teachers have a modern, Uzbek-language dashboard built for users with limited digital experience. All list views use DataTable with sorting and pagination.
**FRs covered:** FR1, NFR8

### Epic 6: Design System Consistency
The admin dashboard speaks one visual language — semantic color tokens replace every hardcoded palette class, Badge and Card components are used consistently throughout, and every list page has a polished, uniform structure.
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22
**UX-DRs covered:** UX-DR6, UX-DR7, UX-DR8, UX-DR9, UX-DR10

---

## Epic 1: Simplified Student Onboarding

Students can start using the bot instantly — no email or password. Telegram identity and phone number is all they need. The bot never crashes due to Telegram API errors.

### Story 1.1: Telegram Auto-Registration API

As a student,
I want to be automatically registered when I first use the bot,
So that I don't need to create an account manually.

**Acceptance Criteria:**

**Given** a new student sends `/start` for the first time
**When** the bot calls `POST /api/auth/telegram` with `{ telegramId, fullName, phone }`
**Then** the API creates a new User record with role STUDENT, `email` null, and returns `{ token, user }`
**And** `telegramId` and `phone` are stored as unique fields on the User model

**Given** an existing student sends `/start` again
**When** the bot calls `POST /api/auth/telegram` with the same `telegramId`
**Then** the API finds the existing user and returns a fresh `{ token, user }` without creating a duplicate

**Given** the schema migration runs
**When** applied to the existing database
**Then** `User.email` becomes nullable, `User.telegramId`, `User.fullName`, `User.phone` fields are added with unique constraints on `telegramId` and `phone`
**And** the existing admin user record is unaffected

---

### Story 1.2: Bot Onboarding Flow

As a student,
I want the bot to greet me and collect my name and phone number on first use,
So that I can start taking tests without typing a password.

**Acceptance Criteria:**

**Given** a student opens the bot for the first time
**When** they send `/start`
**Then** the bot asks for their full name in Uzbek: "Ismingiz va familiyangizni kiriting:"

**Given** the student enters their full name
**When** the bot receives the text
**Then** the bot requests phone number using Telegram's native contact share button: "Telefon raqamingizni ulashing:" with a `KeyboardButton` requesting contact

**Given** the student shares their phone number via Telegram contact
**When** the bot receives the contact
**Then** the bot calls `POST /api/auth/telegram`, stores the returned token in grammY session, and displays the main menu in Uzbek
**And** subsequent `/start` commands from the same user skip onboarding and go directly to main menu

---

### Story 1.3: Bot Global Error Handling

As a system operator,
I want the bot to never crash due to Telegram API errors,
So that students can always use the bot regardless of network issues or stale callbacks.

**Acceptance Criteria:**

**Given** any unhandled error occurs in a bot handler
**When** the error is thrown
**Then** `bot.catch()` intercepts it, logs the error details, and the bot continues running without restarting

**Given** a student taps an old inline keyboard button (query expired >10 seconds)
**When** `answerCallbackQuery` throws `GrammyError: query is too old`
**Then** the error is caught silently in a try/catch, the bot does not crash, and no error is shown to the student

**Given** any bot callback handler encounters an unexpected error
**When** the error is thrown inside the handler
**Then** the bot sends a generic Uzbek error message: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring." and continues operating

---

### Story 1.4: Clean Messages After Authentication

As a student,
I want old bot messages and buttons to be removed after I log in,
So that the chat stays clean and uncluttered.

**Acceptance Criteria:**

**Given** a student completes the onboarding flow successfully
**When** the bot receives the token from the API
**Then** the bot deletes the previous onboarding message using `ctx.deleteMessage()`
**And** displays the main menu as a fresh message in Uzbek

**Given** `ctx.deleteMessage()` fails (message older than 48 hours or already deleted)
**When** the delete throws a Telegram API error
**Then** the error is caught silently and the main menu is still shown
**And** the bot does not crash

---

## Epic 2: Test Access Control

Teachers control test access via a 3-digit code. Students unlock tests with the code, and the system enforces one-attempt rules with friendly feedback.

### Story 2.1: Test Password & One-Attempt Schema

As a teacher,
I want to set a 3-digit access code and one-attempt limit when creating a test,
So that I control who can access the test and how many times.

**Acceptance Criteria:**

**Given** the schema migration runs
**When** applied to the existing database
**Then** `Test.testPassword String?` and `Test.allowOnlyOneAttempt Boolean` (default false) fields are added
**And** all existing Test records are unaffected (testPassword null, allowOnlyOneAttempt false)

**Given** a teacher calls `POST /api/tests` or `PUT /api/tests/:id`
**When** the request body includes `testPassword` and/or `allowOnlyOneAttempt`
**Then** the API validates and persists both fields
**And** `testPassword` is optional — tests without a password remain accessible without a code

---

### Story 2.2: Test Unlock Endpoint

As a student,
I want to enter a 3-digit code to access a test,
So that I can only take tests the teacher has shared with me.

**Acceptance Criteria:**

**Given** a student calls `POST /api/tests/unlock` with `{ testPassword: "472" }`
**When** a test with that password exists
**Then** the API returns the test info `{ id, title, description, timeLimitMinutes, pointsPerQuestion, isAlwaysAvailable, availableFrom, availableUntil }`
**And** the response does not include the testPassword field

**Given** a student calls `POST /api/tests/unlock` with a code that matches no test
**When** the API processes the request
**Then** it returns `{ error: "Test topilmadi", code: "TEST_NOT_FOUND" }` with status 404

**Given** the request body is missing `testPassword` or it is not a 3-character string
**When** Zod validation runs
**Then** the API returns `{ error: "Validation failed", details: [...] }` with status 400

---

### Story 2.3: Bot Test Unlock Flow

As a student,
I want to enter a test code in the bot and see test details before starting,
So that I know what I'm about to attempt.

**Acceptance Criteria:**

**Given** a student taps the main menu button "Testni boshlash"
**When** the bot receives the callback
**Then** the bot asks: "Test kodini kiriting (3 ta raqam):"

**Given** the student types a 3-digit code
**When** the bot calls `POST /api/tests/unlock`
**Then** on success, the bot displays test info in Uzbek: title, time limit, question count, points per question, and a "Boshlash ▶️" button

**Given** the student enters an incorrect code
**When** the API returns 404
**Then** the bot replies: "Noto'g'ri kod. Qayta urinib ko'ring." and prompts for the code again

---

### Story 2.4: One-Attempt Enforcement

As a student,
I want to see my previous score if I already completed a test,
So that I understand why I cannot retake it.

**Acceptance Criteria:**

**Given** a student calls `POST /api/tests/:testId/attempts/start`
**When** `test.allowOnlyOneAttempt` is true and the student already has a completed attempt (`submittedAt IS NOT NULL`) for that test
**Then** the API returns `{ error: "Siz bu testni allaqachon topshirgansiz", code: "ATTEMPT_ALREADY_EXISTS" }` with status 409

**Given** the API returns 409 in the bot
**When** the bot receives the error response
**Then** the bot displays the student's previous attempt score in Uzbek: "✅ Siz bu testni allaqachon topshirgansiz!\n\nSizning natijangiz: {score} / {maxScore} ({percent}%)"

**Given** `test.allowOnlyOneAttempt` is false
**When** the student tries to start the same test again
**Then** the API allows it and creates a new attempt normally

---

## Epic 3: Reliable Test-Taking Experience

Students have a clean, distraction-free test experience with clear answer confirmation and time limit awareness.

### Story 3.1: Show Selected Answer in Bot

As a student,
I want to see my selected answer displayed after I choose it,
So that I have a clear record of what I answered before moving to the next question.

**Acceptance Criteria:**

**Given** a student taps an answer option during a test
**When** the bot receives the callback query
**Then** the bot edits the existing question message to show the selected answer as text below the question:
`"✅ Sizning javobingiz: {label}) {optionText}"`
**And** the inline keyboard is removed from the message

**Given** the answer is recorded via `POST /api/attempts/:attemptId/answers`
**When** the API responds successfully
**Then** the bot advances to the next question as a new message
**And** if it was the last question, the bot calls submit and shows the result

**Given** `ctx.editMessageText()` fails (message too old or deleted)
**When** the edit throws a Telegram API error
**Then** the error is caught silently and the bot still advances to the next question

---

### Story 3.2: Time Limit Enforcement

As a student,
I want to be clearly informed if my time has run out,
So that I understand why my submission was not accepted.

**Acceptance Criteria:**

**Given** a student attempts to submit a test via `POST /api/attempts/:attemptId/submit`
**When** `now > attempt.startedAt + test.timeLimitMinutes`
**Then** the API returns `{ error: "Vaqt tugadi", code: "TIME_LIMIT_EXCEEDED" }` with status 403
**And** the attempt is not marked as submitted

**Given** the API returns 403 with `TIME_LIMIT_EXCEEDED`
**When** the bot receives the error
**Then** the bot sends: "⏱ Vaqt tugadi! Afsuski, javoblaringiz qabul qilinmadi." and shows the main menu

**Given** a student is mid-test and their time has not yet expired
**When** they submit normally
**Then** the time check passes and submission proceeds as before

---

## Epic 4: Pass Threshold & Results

Teachers set minimum passing scores. Both teacher and student see meaningful pass/fail results. Timed-out attempts are visible in the dashboard.

### Story 4.1: Pass Threshold & Timed-Out Schema

As a developer,
I want the database schema to support pass thresholds and timed-out attempt tracking,
So that teachers can configure passing scores and the system can record time violations.

**Acceptance Criteria:**

**Given** the schema migration runs
**When** applied to the existing database
**Then** `Test.passingScore Float?` is added (nullable, no default)
**And** `TestAttempt.timedOutAt DateTime?` is added (nullable)
**And** all existing records are unaffected

---

### Story 4.2: Pass Threshold API

As a teacher,
I want to set a passing score when creating or editing a test,
So that the system can automatically determine if a student passed.

**Acceptance Criteria:**

**Given** a teacher calls `POST /api/tests` or `PUT /api/tests/:id` with `passingScore: 70`
**When** the API processes the request
**Then** `passingScore` is validated (positive Float or null) and persisted
**And** the response includes `passingScore` in the returned test object

**Given** the submit endpoint `POST /api/attempts/:attemptId/submit` is called when time has expired
**When** `now > attempt.startedAt + test.timeLimitMinutes`
**Then** the API sets `attempt.timedOutAt = now()` before returning the 403 error

**Given** `GET /api/tests/:testId/attempts` is called by an admin
**When** the API returns the attempts list
**Then** each attempt includes a computed `status` field: `"submitted"` (submittedAt not null), `"timed_out"` (timedOutAt not null), or `"in_progress"` (both null)
**And** each attempt includes `passed: boolean | null` — true if score >= passingScore, false if score < passingScore, null if passingScore not set

---

### Story 4.3: Pass Threshold Dashboard Form

As a teacher,
I want to optionally set a minimum passing score when creating or editing a test,
So that the system can automatically evaluate student results.

**Acceptance Criteria:**

**Given** a teacher opens the test create or edit form
**When** the form renders
**Then** a `passingScore` number input is shown with Uzbek label: "O'tish bali (ixtiyoriy)"
**And** helper text explains: "Agar ko'rsatilsa, talabalar shu baldan yuqori to'plasa, 'O'tdi' deb belgilanadi"

**Given** the teacher leaves `passingScore` empty and submits
**When** the form data is sent to the API
**Then** `passingScore` is sent as `null` and the test is saved without a threshold

**Given** the teacher enters a valid number and submits
**When** the form data is sent to the API
**Then** `passingScore` is persisted and shown correctly on the test detail page

---

### Story 4.4: Pass/Fail Results in Dashboard

As a teacher,
I want to see pass/fail status and attempt state for each student in the results table,
So that I can quickly assess class performance.

**Acceptance Criteria:**

**Given** a teacher views the results page for a test with `passingScore` set
**When** the results table renders
**Then** each row shows a status badge: "O'tdi" (green), "O'tmadi" (red), "Vaqt tugadi" (orange), "Jarayonda" (gray)
**And** the badge is implemented using the shadcn Badge component

**Given** a test has no `passingScore` set
**When** the results table renders
**Then** no pass/fail badge is shown — only the score and status columns

**Given** an attempt has `timedOutAt` set
**When** the results table renders
**Then** the row shows "Vaqt tugadi" badge regardless of score

---

### Story 4.5: Pass/Fail Message in Bot

As a student,
I want to know whether I passed or failed immediately after submitting a test,
So that I get meaningful feedback on my performance.

**Acceptance Criteria:**

**Given** a student submits a test and the test has `passingScore` set
**When** the bot receives the submission result
**Then** the result message includes pass/fail status:
`"🎉 Test yakunlandi!\n\nSizning balingiz: {score} / {maxScore} ({percent}%)\n\n✅ Natija: O'tdingiz!"` or `"❌ Natija: O'tmadingiz."`

**Given** a student submits a test with no `passingScore` set
**When** the bot receives the submission result
**Then** only the score is shown without pass/fail text:
`"🎉 Test yakunlandi!\n\nSizning balingiz: {score} / {maxScore} ({percent}%)"`

---

## Epic 5: Teacher Dashboard Overhaul

Teachers have a modern, Uzbek-language dashboard built for users with limited digital experience. All list views use DataTable with sorting and pagination.

### Story 5.1: Tests List Page

As a teacher,
I want to see all my tests in a clear, sortable table,
So that I can quickly find and manage any test.

**Acceptance Criteria:**

**Given** a teacher navigates to `/dashboard/tests`
**When** the page loads
**Then** tests are displayed in a shadcn DataTable with columns: Nomi, Savollar soni, Vaqt chegarasi, Holat, Amallar
**And** the table supports sorting by name and creation date
**And** the table supports pagination (10 rows per page default)
**And** all column headers and action buttons are in Uzbek

**Given** no tests exist yet
**When** the page loads
**Then** an empty state message is shown in Uzbek: "Hali testlar yo'q. Yangi test yarating."
**And** a prominent "Yangi test" button is visible

---

### Story 5.2: Test Create & Edit Forms

As a teacher,
I want a clear, well-labeled form to create and edit tests,
So that I can configure all test settings without confusion.

**Acceptance Criteria:**

**Given** a teacher opens the test create or edit form
**When** the form renders
**Then** fields are grouped in labeled sections with Uzbek labels and helper text for every field
**And** the form includes all fields: Nomi, Tavsif, Har bir savol uchun ball, Vaqt chegarasi (daqiqa), Har doim mavjud, Boshlanish/tugash vaqti, Test kodi (3 ta raqam), Faqat bir marta topshirish, O'tish bali

**Given** a teacher submits the form with missing required fields
**When** validation runs
**Then** inline error messages appear in Uzbek beneath each invalid field

**Given** a teacher successfully saves a test
**When** the form submits
**Then** they are redirected to the test detail page with a success toast in Uzbek: "Test muvaffaqiyatli saqlandi"

---

### Story 5.3: Test Results Page

As a teacher,
I want to see a detailed results table for each test,
So that I can evaluate how students performed.

**Acceptance Criteria:**

**Given** a teacher navigates to `/dashboard/tests/:id/results`
**When** the page loads
**Then** a DataTable shows columns: Talaba ismi, Ball, Maksimal ball, Natija, Holat, Topshirilgan vaqt, Sarflangan vaqt
**And** the Natija column shows a shadcn Badge: "O'tdi" (green), "O'tmadi" (red), or empty if no passingScore set
**And** the Holat column shows: "Topshirilgan", "Vaqt tugadi", or "Jarayonda"

**Given** no attempts exist for the test
**When** the page loads
**Then** an empty state is shown: "Hali hech kim bu testni topshirmagan."

---

### Story 5.4: Users List Page

As a teacher,
I want to see all registered students in a clear table,
So that I can monitor who is using the platform.

**Acceptance Criteria:**

**Given** a teacher navigates to `/dashboard/users`
**When** the page loads
**Then** a DataTable shows columns: Ismi, Telefon raqami, Rol, Ro'yxatdan o'tgan sana
**And** role is shown as a shadcn Badge: "O'qituvchi" (blue) or "Talaba" (gray)
**And** the table supports sorting and pagination

**Given** the teacher searches or filters by name
**When** they type in the search input
**Then** the table filters results in real time

---

### Story 5.5: Navigation & Layout

As a teacher,
I want a simple navigation structure where any page is reachable in 2 clicks,
So that I never feel lost in the dashboard.

**Acceptance Criteria:**

**Given** a teacher is logged in
**When** they view any dashboard page
**Then** a sidebar or top navigation shows links: Bosh sahifa, Testlar, Foydalanuvchilar — all in Uzbek
**And** the active page is visually highlighted

**Given** a teacher is on any page
**When** they click any nav item
**Then** they reach their destination in one click (maximum 2 clicks from any screen)

**Given** the dashboard is viewed on a smaller screen
**When** the viewport is mobile-sized
**Then** the navigation collapses into a hamburger menu and all pages remain accessible

---

## Epic 6: Design System Consistency

The admin dashboard speaks one visual language — semantic color tokens replace every hardcoded palette class, Badge and Card components are used consistently throughout, and every list page has a polished, uniform structure.

### Story 6.1: Add Semantic Status Color Tokens

As an admin dashboard maintainer,
I want semantic CSS tokens for success, error, and warning states,
So that status colors adapt correctly to light/dark mode and can be changed from one place.

**Acceptance Criteria:**

**Given** the file `apps/admin-dashboard/app/globals.css` is opened
**When** the dev adds `--success`, `--success-foreground`, `--error`, `--error-foreground`, `--warning`, `--warning-foreground` inside `:root {}`
**Then** each token has a valid OKLCH value matching the visual intent (green/red/amber)
**And** `.dark {}` contains matching dark-mode overrides for all six tokens
**And** `@theme inline {}` maps `--color-success`, `--color-error`, `--color-warning` (and foregrounds) to their CSS variable counterparts
**And** Tailwind utility classes `bg-success`, `text-success-foreground`, `bg-error`, `text-error-foreground`, `bg-warning`, `text-warning-foreground` are usable in component files

---

### Story 6.2: Migrate Badge Variants to Semantic Tokens

As a teacher viewing test results,
I want pass/fail/warning badges to render correctly in both light and dark mode,
So that status is always legible regardless of theme.

**Acceptance Criteria:**

**Given** Story 6.1 tokens are in place
**When** the dev updates `apps/admin-dashboard/components/ui/badge.tsx` lines 14–16
**Then** `success` variant uses `bg-success text-success-foreground` (not `bg-green-100 text-green-800`)
**And** `error` variant uses `bg-error text-error-foreground` (not `bg-red-100 text-red-800`)
**And** `warning` variant uses `bg-warning text-warning-foreground` (not `bg-orange-100 text-orange-700`)
**And** no hardcoded Tailwind palette color classes remain in `badge.tsx`
**And** all existing badge usages (`<Badge variant="success">`, etc.) render correctly without any changes to call sites

---

### Story 6.3: Refactor StatCard to Use Card Component

As a teacher viewing the dashboard home,
I want stat cards to look consistent with the rest of the dashboard's card surfaces,
So that the home page feels polished and adapts to dark mode correctly.

**Acceptance Criteria:**

**Given** the `StatCard` component in `apps/admin-dashboard/app/dashboard/page.tsx` (lines 39–46)
**When** the dev replaces the raw `div` with `<Card>` and `<CardContent className="pt-6">`
**Then** the label uses `text-muted-foreground` (not `text-zinc-500 dark:text-zinc-400`)
**And** the value text retains `text-4xl font-bold mt-1`
**And** normal cards use `border-border` via the Card component (not `border-zinc-200 dark:border-zinc-800`)
**And** warning cards use `border-warning` on the Card and `text-warning` on the value (not `border-amber-400` / `text-amber-500`)
**And** card backgrounds use `bg-card` via the Card component (not `bg-white dark:bg-zinc-900`)
**And** the stat grid layout (`grid grid-cols-2 sm:grid-cols-4 gap-4`) is preserved

---

### Story 6.4: Purge Hardcoded Gray Text Across Dashboard

As a developer maintaining the dashboard,
I want all secondary text to use the `text-muted-foreground` design token,
So that secondary text color is controlled from one place and dark mode works correctly everywhere.

**Acceptance Criteria:**

**Given** the dashboard pages in `apps/admin-dashboard/app/dashboard/`
**When** the dev replaces all instances of `text-gray-500`, `text-zinc-500`, and `text-zinc-400` with `text-muted-foreground`
**Then** a grep for `text-gray-500` and `text-zinc-500` in `app/dashboard/**` (excluding `ui/Sidebar.tsx`) returns zero results
**And** all affected text visually renders as secondary/muted text in both light and dark modes
**And** sidebar nav styles (`text-zinc-500` active/inactive states) are left unchanged — they use the sidebar token space intentionally

---

### Story 6.5: Standardize Table Wrappers with Token Classes

As a teacher viewing any list page,
I want tables to have a consistent visual container that matches the rest of the dashboard,
So that list pages look uniform regardless of which page I'm on.

**Acceptance Criteria:**

**Given** the recent attempts table wrapper in `apps/admin-dashboard/app/dashboard/page.tsx` (line 97)
**When** the dev replaces `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900` with `border-border bg-card`
**Then** the table container renders with the correct themed border and background in both light and dark modes
**And** the `rounded-xl` and `overflow-hidden` classes are preserved

**Given** the students page `apps/admin-dashboard/app/dashboard/students/page.tsx`
**When** the dev wraps the existing `<Table>` in `<div className="rounded-xl border border-border overflow-hidden bg-card">`
**Then** the table has a consistent visual container matching other list pages

---

### Story 6.6: Replace Inline Pass/Fail Spans with Badge Component

As a teacher reviewing recent attempts on the dashboard home,
I want pass/fail status to use the same badge style as the test results page,
So that status indicators look consistent across the whole dashboard.

**Acceptance Criteria:**

**Given** Story 6.2 Badge variants are in place
**When** the dev updates `apps/admin-dashboard/app/dashboard/page.tsx` lines 133–142
**Then** `passed === true` renders `<Badge variant="success">O'tdi</Badge>` (not `<span className="text-green-600">`)
**And** `passed === false` renders `<Badge variant="error">O'tmadi</Badge>` (not `<span className="text-red-500">`)
**And** `passed === null` renders `<span className="text-muted-foreground text-sm">—</span>`
**And** no `text-green-*` or `text-red-*` classes remain in `dashboard/page.tsx`

---

### Story 6.7: Replace Hardcoded Role Colors with Badge in Students Page

As a teacher viewing the users list,
I want Admin and Student roles displayed as styled badges,
So that roles are immediately scannable and visually consistent with other status indicators.

**Acceptance Criteria:**

**Given** Story 6.2 Badge variants are in place
**When** the dev updates the role column in `apps/admin-dashboard/app/dashboard/students/page.tsx` (lines 63–70)
**Then** Admin role renders `<Badge variant="default">Admin</Badge>`
**And** Student role renders `<Badge variant="secondary">O'quvchi</Badge>`
**And** the hardcoded `text-blue-600 font-medium` and `text-gray-600` classes are removed
**And** both badges are correctly styled in light and dark modes

---

### Story 6.8: Add Styled Table Wrapper to Students Page

As a teacher viewing the users list,
I want the users table to have the same visual container as other list-page tables,
So that the students page looks consistent with the tests and attempts pages.

**Acceptance Criteria:**

**Given** the `<Table>` in `apps/admin-dashboard/app/dashboard/students/page.tsx`
**When** the dev wraps it in `<div className="rounded-xl border border-border overflow-hidden bg-card">`
**Then** the table has a rounded border container in both light and dark modes
**And** the existing table columns and data are unchanged
**And** the wrapper matches the pattern used on the dashboard home recent attempts table (after Story 6.5)

---

### Story 6.9: Migrate Question Option Colors to Token Classes

As a teacher reviewing a test's questions,
I want correct and incorrect options to use themed colors,
So that the question list renders correctly in both light and dark modes.

**Acceptance Criteria:**

**Given** Story 6.1 tokens are in place
**When** the dev updates question option rendering in `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx` (lines 118–122)
**Then** correct options (`option.isCorrect === true`) use `text-success` (not `text-green-600`)
**And** incorrect options (`option.isCorrect === false`) use `text-error` (not `text-red-500`)
**And** the option letter prefix (`a)`, `b)`, etc.) and option text are visually unchanged

---

### Story 6.10: Add Page Subtitles to Students and Tests List Pages

As a teacher navigating the dashboard,
I want every list page to have a subtitle under the heading,
So that pages feel polished and consistent with the dashboard home page.

**Acceptance Criteria:**

**Given** `apps/admin-dashboard/app/dashboard/students/page.tsx`
**When** the dev adds a subtitle `<p>` after the H1
**Then** the subtitle reads `"Barcha ro'yxatdan o'tgan foydalanuvchilar"` with classes `text-sm text-muted-foreground mt-1`
**And** the H1 retains `text-2xl font-bold` with `mb-1` (adjusted from `mb-6` since subtitle follows)

**Given** `apps/admin-dashboard/app/dashboard/tests/page.tsx`
**When** the dev adds a subtitle `<p>` after the H1
**Then** the subtitle reads `"Barcha testlar ro'yxati"` with classes `text-sm text-muted-foreground mt-1`
**And** the H1 retains `text-2xl font-bold` with `mb-1`

---

## Telegram Mini App — Requirements Inventory

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

## Epic List (Mini App Epics)

### Epic 7: Mini App Foundation & Student Auth
Students can open the Mini App from Telegram, authenticate instantly using their Telegram identity, and land on a home screen — no passwords, no sign-up forms. The app is deployed and live on Vercel.
**FRs covered:** FR-MA1, FR-MA2, FR-MA3, FR-MA4, FR-MA10, FR-MA11
**NFRs covered:** NFR-MA1, NFR-MA2, NFR-MA4, NFR-MA5, NFR-MA7

### Epic 8: Test-Taking in the Mini App
Students can browse tests, unlock them with a code, take a full attempt with question-by-question navigation, submit, and immediately see their score and pass/fail result — all inside Telegram.
**FRs covered:** FR-MA5, FR-MA6, FR-MA7, FR-MA8, FR-MA12
**NFRs covered:** NFR-MA3, NFR-MA5

### Epic 9: Bot Integration
The Telegram bot surfaces the Mini App through a persistent Menu Button. Students no longer need to remember a command — one tap launches the full Mini App experience. Existing bot flows are unaffected.
**FRs covered:** FR-MA9
**NFRs covered:** NFR-MA6

---

## Epic 7: Mini App Foundation & Student Auth

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

## Epic 8: Test-Taking in the Mini App

Students can browse tests, unlock with a code, take a full attempt question-by-question, submit, and immediately see their score and pass/fail result — entirely inside Telegram.

### Story 8.1: Tests List Screen

As a student,
I want to see a list of tests I can take in the Mini App,
So that I know what's available and can choose which to unlock.

**Acceptance Criteria:**

**Given** an authenticated student taps "Testlarga o'tish" from the home screen
**When** the tests list screen loads
**Then** it calls `GET /api/tests` with the student's JWT and displays each test's title, time limit, and points per question
**And** each test row has an "Ochish" (Unlock) button

**Given** no tests are available
**When** the screen renders
**Then** an empty state message shows: "Hozircha testlar mavjud emas."

**Given** the API call fails (network error or 401)
**When** the screen handles the error
**Then** a retry button is shown with message: "Testlarni yuklashda xatolik yuz berdi."

**Given** the student is on the tests list screen
**When** Telegram's Back Button is visible
**Then** tapping it navigates back to the home screen

---

### Story 8.2: Test Unlock Screen

As a student,
I want to enter a 3-digit code to unlock a specific test,
So that I can only access tests my teacher has shared with me.

**Acceptance Criteria:**

**Given** a student taps "Ochish" on a test row
**When** the unlock screen renders
**Then** a numeric input field is shown with label "Test kodini kiriting:" and a "Tasdiqlash" button

**Given** the student enters a correct 3-digit code and taps "Tasdiqlash"
**When** `POST /api/tests/unlock` is called with `{ testPassword: code }`
**Then** on success, the app navigates to the test detail/start screen showing: title, question count, time limit, and a "Boshlash" button

**Given** the student enters an incorrect code
**When** the API returns 404
**Then** an inline error shows: "Noto'g'ri kod. Qayta urinib ko'ring."
**And** the input is cleared for retry

**Given** the test has no password (`testPassword` is null)
**When** the student taps "Ochish"
**Then** the app skips the unlock screen and goes directly to the test detail/start screen

**Given** the student is on the unlock screen
**When** they tap Telegram's Back Button
**Then** they return to the tests list screen

---

### Story 8.3: Test-Taking Screen

As a student,
I want to answer questions one at a time with clear navigation,
So that I can complete a test attempt with a focused, distraction-free experience.

**Acceptance Criteria:**

**Given** a student taps "Boshlash" on the test detail screen
**When** `POST /api/tests/:testId/attempts/start` is called
**Then** the app receives the shuffled question list and displays the first question with answer options as tappable buttons

**Given** a student taps an answer option
**When** `POST /api/attempts/:attemptId/answers` is called with `{ questionId, optionId }`
**Then** the selected option is visually highlighted and locked (no re-selection)
**And** a "Keyingisi" (Next) button appears to advance to the next question

**Given** the student is on question N of M
**When** the question renders
**Then** a progress indicator shows "N / M savol" at the top of the screen

**Given** the student reaches the last question and taps "Keyingisi"
**When** `POST /api/attempts/:attemptId/submit` is called
**Then** the app navigates to the results screen

**Given** `submit` returns 403 with `TIME_LIMIT_EXCEEDED`
**When** the app handles the error
**Then** it navigates to the results screen showing: "⏱ Vaqt tugadi! Javoblaringiz qabul qilinmadi."

**Given** the student is mid-test
**When** Telegram's Back Button is tapped
**Then** a confirmation dialog shows: "Testni tark etmoqchimisiz? Progress saqlanmaydi." with "Ha" and "Yo'q" options

---

### Story 8.4: Results Screen

As a student,
I want to see my score and pass/fail result immediately after submitting,
So that I get clear feedback on my performance.

**Acceptance Criteria:**

**Given** the test is submitted successfully
**When** the results screen renders
**Then** it displays: "🎉 Test yakunlandi!" with the score `{score} / {maxScore} ({percent}%)`

**Given** the test has a `passingScore` set and the student passed
**When** the results screen renders
**Then** it shows: "✅ Natija: O'tdingiz!" in green

**Given** the test has a `passingScore` set and the student did not pass
**When** the results screen renders
**Then** it shows: "❌ Natija: O'tmadingiz." in red

**Given** the test has no `passingScore`
**When** the results screen renders
**Then** only the score is shown, with no pass/fail indicator

**Given** the student views the results screen
**When** they tap "Bosh sahifaga qaytish"
**Then** they are navigated back to the home screen
**And** Telegram's Back Button is hidden on this screen (result is a terminal state)

---

## Epic 9: Bot Integration

The Telegram bot surfaces the Mini App through a persistent Menu Button. Students no longer need to remember a command — one tap launches the full Mini App experience. Existing bot flows are unaffected.

### Story 9.1: Bot Menu Button for Mini App

As a student,
I want a persistent button in the Telegram bot that opens the Mini App,
So that I can launch the Mini App with one tap without needing to know any bot commands.

**Acceptance Criteria:**

**Given** the Vercel deployment URL is known (from Epic 7)
**When** the bot starts up
**Then** `bot.api.setChatMenuButton()` is called with `{ type: "web_app", text: "Testlar", web_app: { url: MINI_APP_URL } }` using the `MINI_APP_URL` environment variable

**Given** `MINI_APP_URL` is not set in the environment
**When** the bot starts
**Then** it logs a startup warning and falls back to the default menu button (no crash)

**Given** the menu button is configured
**When** a student opens the bot in Telegram
**Then** a "Testlar" button appears in the bottom-left of the message input area
**And** tapping it opens the Mini App at the Vercel URL inside Telegram

**Given** the menu button is added
**When** a student uses any existing bot commands (`/start`, test unlock flow, etc.)
**Then** all existing bot flows work exactly as before — no regressions
**And** `MINI_APP_URL` is documented in `.env.example`
