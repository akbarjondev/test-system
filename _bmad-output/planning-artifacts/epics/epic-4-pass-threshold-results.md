# Epic 4: Pass Threshold & Results

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
