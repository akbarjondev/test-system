---
stepsCompleted: ["step-01", "step-02", "step-03", "step-04"]
inputDocuments:
  - "artifacts/architecture.md"
  - "artifacts/data-model.md"
  - "artifacts/api-reference.md"
  - "user task list (session input)"
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

### FR Coverage Map

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
FR13: Epic 2 — testPassword on Test schema + unlock API endpoint + bot flow
NFR8: Epic 5 — All user-facing text in Uzbek language

## Epic List

### Epic 1: Simplified Student Onboarding
Students can start using the bot instantly — no email or password. Telegram identity and phone number is all they need. The bot never crashes due to Telegram API errors.
**FRs covered:** FR9, FR10, FR12

### Epic 2: Test Access Control
Teachers control test access via a 3-digit code. Students unlock tests with the code, and the system enforces one-attempt rules with friendly feedback.
**FRs covered:** FR6, FR7, FR13

### Epic 3: Reliable Test-Taking Experience
Students have a clean, distraction-free test experience with clear answer confirmation and time limit awareness.
**FRs covered:** FR8 (bot + API enforcement), FR11

### Epic 4: Pass Threshold & Results
Teachers set minimum passing scores. Both teacher and student see meaningful pass/fail results. Timed-out attempts are visible in the dashboard.
**FRs covered:** FR2, FR3, FR4, FR5, FR8 (timedOutAt schema + dashboard display)

### Epic 5: Teacher Dashboard Overhaul
Teachers have a modern, Uzbek-language dashboard built for users with limited digital experience. All list views use DataTable with sorting and pagination.
**FRs covered:** FR1, NFR8

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
