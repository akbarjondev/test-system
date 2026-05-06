# Epic 8: Test-Taking in the Mini App

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
