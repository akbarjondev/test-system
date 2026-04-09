# Story 2.4: One-Attempt Enforcement

Status: review

## Story

As a student,
I want to see my previous score if I already completed a test,
So that I understand why I cannot retake it.

## Acceptance Criteria

1. **Given** a student calls `POST /api/tests/:testId/attempts/start`,
   **When** `test.allowOnlyOneAttempt` is true and the student already has a completed attempt (`submittedAt IS NOT NULL`) for that test,
   **Then** the API returns `{ error: "Siz bu testni allaqachon topshirgansiz", code: "ATTEMPT_ALREADY_EXISTS" }` with status 409

2. **Given** the API returns 409 in the bot,
   **When** the bot receives the error response,
   **Then** the bot displays the student's previous attempt score in Uzbek: "✅ Siz bu testni allaqachon topshirgansiz!\n\nSizning natijangiz: {score} / {maxScore} ({percent}%)"

3. **Given** `test.allowOnlyOneAttempt` is false,
   **When** the student tries to start the same test again,
   **Then** the API allows it and creates a new attempt normally

## Tasks / Subtasks

- [x] Task 1: Add repository method to `apps/api/src/repositories/attempts.repository.ts`
  - [x] Add `findCompletedAttemptByTestAndStudent(testId: string, studentId: string): Promise<TestAttempt | null>`
  - [x] Query: `prisma.testAttempt.findFirst({ where: { testId, studentId, submittedAt: { not: null } } })`

- [x] Task 2: Update `AttemptsService.startTest` in `apps/api/src/services/attempts.service.ts`
  - [x] After `validateTestAvailability(test)`, add one-attempt check:
    ```ts
    if (test.allowOnlyOneAttempt) {
      const existing = await AttemptsRepository.findCompletedAttemptByTestAndStudent(testId, studentId);
      if (existing) throw new Error("ATTEMPT_ALREADY_EXISTS");
    }
    ```
  - [x] Remove or replace the commented-out duplicate check (lines 38-41 in current file)

- [x] Task 3: Update `AttemptsController.startTest` in `apps/api/src/controllers/attempts.controller.ts`
  - [x] In the catch block for `startTest`, handle `ATTEMPT_ALREADY_EXISTS` error:
    ```ts
    if (error.message === "ATTEMPT_ALREADY_EXISTS") {
      return res.status(409).json({ error: "Siz bu testni allaqachon topshirgansiz", code: "ATTEMPT_ALREADY_EXISTS" });
    }
    ```

- [x] Task 4: Update bot to handle 409 response
  - [x] In the bot's `start_unlocked_test` (or equivalent) handler, after calling `POST /api/tests/{testId}/attempts/start`:
  - [x] If response status is 409: fetch the previous attempt using `GET /api/attempts/my-attempts` and test details for question count
  - [x] Display message: "✅ Siz bu testni allaqachon topshirgansiz!\n\nSizning natijangiz: {score} / {maxScore} ({percent}%)"
  - [x] Show main menu after displaying the result

## Dev Notes

### Critical Architecture Rules

```
POST /api/tests/:testId/attempts/start
  → validate(startAttemptSchema)
  → verifyTokenMiddleware
  → AttemptsController.startTest
      → AttemptsService.startTest
          → validateTestAvailability           [existing]
          → if allowOnlyOneAttempt:            [NEW]
              → findCompletedAttemptByTestAndStudent
              → if found: throw ATTEMPT_ALREADY_EXISTS
          → create attempt (existing)
```

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/api/src/repositories/attempts.repository.ts` | Add findCompletedAttemptByTestAndStudent |
| `apps/api/src/services/attempts.service.ts` | Add one-attempt check in startTest |
| `apps/api/src/controllers/attempts.controller.ts` | Handle ATTEMPT_ALREADY_EXISTS error |
| `apps/telegram-bot/src/bot.ts` | Handle 409 response in start attempt handler |

### Service Change Pattern

```ts
// In AttemptsService.startTest, after validateTestAvailability:
if (test.allowOnlyOneAttempt) {
  const existing = await AttemptsRepository.findCompletedAttemptByTestAndStudent(
    testId,
    studentId
  );
  if (existing) {
    throw new Error("ATTEMPT_ALREADY_EXISTS");
  }
}
```

### Bot 409 Handler Pattern

```ts
if (response.status === 409) {
  // Show previous score — fetch from existing attempt or use data from 409 body if included
  const totalQuestions = ctx.session.lastTestQuestionCount ?? 0;
  const pointsPerQ = ctx.session.lastTestPointsPerQuestion ?? 1;
  const maxScore = totalQuestions * pointsPerQ;
  // Note: score not available in 409 — show generic message
  await ctx.reply("✅ Siz bu testni allaqachon topshirgansiz!");
  // Optionally redirect to GET /api/attempts/student to fetch last score
  return;
}
```

### Dependency

Story 2.1 must be merged first — `allowOnlyOneAttempt` field must exist on Test model.

### References

- [Source: apps/api/src/services/attempts.service.ts] — startTest method, lines 18-65
- [Source: apps/api/src/repositories/attempts.repository.ts] — Repository pattern
- [Source: apps/api/src/controllers/attempts.controller.ts] — Error handling pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_None_

### Completion Notes List

- Task 1: Added `findCompletedAttemptByTestAndStudent` to `AttemptsRepository` — queries for a completed (submittedAt IS NOT NULL) attempt for the given testId+studentId combination.
- Task 2: Added one-attempt enforcement block in `AttemptsService.startTest` after `validateTestAvailability`. Removed the stale commented-out block that was there previously.
- Task 3: Added `ATTEMPT_ALREADY_EXISTS` handler in `AttemptsController.startTest` catch block (before other error checks) returning 409 with Uzbek message and code.
- Task 4: Refactored both `start:` (test-detail flow) and `start_unlocked_test` (unlock flow) handlers to use raw `fetch` instead of the `api()` helper so the HTTP status code is accessible. Extracted shared `showAlreadyAttemptedMessage(ctx, testId)` helper that fetches the student's past attempts from `/api/attempts/my-attempts`, finds the one matching the test, fetches test details for question count, then displays the formatted score message before showing the main menu.
- TypeScript compilation passes cleanly (`tsc --noEmit`) for both `apps/api` and `apps/telegram-bot`.
- Pre-existing `@repo/ui` lint failure is unrelated to this story.

### File List

- apps/api/src/repositories/attempts.repository.ts
- apps/api/src/services/attempts.service.ts
- apps/api/src/controllers/attempts.controller.ts
- apps/telegram-bot/src/bot.ts

## Change Log

- 2026-04-09: Story 2.4 implemented — one-attempt enforcement in API (409 ATTEMPT_ALREADY_EXISTS) and bot 409 handler with previous score display (Amelia / claude-sonnet-4-6)
