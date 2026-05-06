# Epic 3: Reliable Test-Taking Experience

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
