# Epic 2: Test Access Control

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
