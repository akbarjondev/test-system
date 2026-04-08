# Story 3.2: Time Limit Enforcement

Status: ready-for-dev

## Story

As a student,
I want to be clearly informed if my time has run out,
So that I understand why my submission was not accepted.

## Acceptance Criteria

1. **Given** a student attempts to submit a test via `POST /api/attempts/:attemptId/submit`,
   **When** `now > attempt.startedAt + test.timeLimitMinutes`,
   **Then** the API returns `{ error: "Vaqt tugadi", code: "TIME_LIMIT_EXCEEDED" }` with status 403
   **And** the attempt is not marked as submitted

2. **Given** the API returns 403 with `TIME_LIMIT_EXCEEDED`,
   **When** the bot receives the error,
   **Then** the bot sends: "⏱ Vaqt tugadi! Afsuski, javoblaringiz qabul qilinmadi." and shows the main menu

3. **Given** a student is mid-test and their time has not yet expired,
   **When** they submit normally,
   **Then** the time check passes and submission proceeds as before

## Tasks / Subtasks

- [ ] Task 1: Add time limit check to `AttemptsService.submitTest` in `apps/api/src/services/attempts.service.ts`
  - [ ] After fetching `test` in `submitTest`, call `this.isTimeLimitExceeded(attempt, test)`:
    ```ts
    if (this.isTimeLimitExceeded(attempt, test)) {
      throw new Error("TIME_LIMIT_EXCEEDED");
    }
    ```
  - [ ] Note: `isTimeLimitExceeded` is already a private static method in AttemptsService — reuse it
  - [ ] This check is MISSING from `submitTest` currently (it exists in `submitAnswer` and `getCurrentAttempt` only)

- [ ] Task 2: Update `AttemptsController.submitTest` in `apps/api/src/controllers/attempts.controller.ts`
  - [ ] In the catch block, handle `TIME_LIMIT_EXCEEDED` error:
    ```ts
    if (error.message === "TIME_LIMIT_EXCEEDED") {
      return res.status(403).json({ error: "Vaqt tugadi", code: "TIME_LIMIT_EXCEEDED" });
    }
    ```

- [ ] Task 3: Update bot to handle 403 TIME_LIMIT_EXCEEDED
  - [ ] In the submit attempt handler in `apps/telegram-bot/src/bot.ts`:
  - [ ] If response status is 403 and `data.code === "TIME_LIMIT_EXCEEDED"`:
  - [ ] Send: "⏱ Vaqt tugadi! Afsuski, javoblaringiz qabul qilinmadi."
  - [ ] Then show main menu

- [ ] Task 4: Verify `isTimeLimitExceeded` handles edge cases
  - [ ] Confirm the method handles `timeLimitMinutes = null` gracefully (should return false — no limit set)
  - [ ] Current implementation: `return elapsedMinutes > test.timeLimitMinutes` — if timeLimitMinutes is null, this returns false (correct)

## Dev Notes

### Critical Finding

`isTimeLimitExceeded` is ALREADY implemented in `AttemptsService` (line 326-330 of attempts.service.ts). It is called in `submitAnswer` and `getCurrentAttempt` but **NOT in `submitTest`**. This story is a surgical one-line addition to `submitTest`.

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/api/src/services/attempts.service.ts` | Add time limit check in submitTest |
| `apps/api/src/controllers/attempts.controller.ts` | Handle TIME_LIMIT_EXCEEDED in catch |
| `apps/telegram-bot/src/bot.ts` | Handle 403 TIME_LIMIT_EXCEEDED in submit handler |

### Service Change — Exact Location

```ts
// In AttemptsService.submitTest, after getting the test (around line 175):
const test = await TestsRepository.getOneTest(attempt.testId);
if (!test) {
  throw new Error("Test not found");
}

// ADD THIS:
if (this.isTimeLimitExceeded(attempt, test)) {
  throw new Error("TIME_LIMIT_EXCEEDED");
}

// Calculate points per question...
```

### Controller Error Handling Pattern

```ts
// In AttemptsController.submitTest catch block:
if (error instanceof Error && error.message === "TIME_LIMIT_EXCEEDED") {
  return res.status(403).json({ error: "Vaqt tugadi", code: "TIME_LIMIT_EXCEEDED" });
}
```

### Bot Handler Pattern

```ts
const response = await fetch(`${API_URL}/api/attempts/${attemptId}/submit`, { ... });
const data = await response.json();

if (response.status === 403 && data.code === "TIME_LIMIT_EXCEEDED") {
  await ctx.reply("⏱ Vaqt tugadi! Afsuski, javoblaringiz qabul qilinmadi.");
  showMainMenu(ctx);
  return;
}
```

### References

- [Source: apps/api/src/services/attempts.service.ts] — isTimeLimitExceeded (line 326), submitTest (line 151)
- [Source: apps/api/src/controllers/attempts.controller.ts] — submitTest error handling pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
