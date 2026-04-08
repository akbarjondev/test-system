# Story 2.4: One-Attempt Enforcement

Status: ready-for-dev

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

- [ ] Task 1: Add repository method to `apps/api/src/repositories/attempts.repository.ts`
  - [ ] Add `findCompletedAttemptByTestAndStudent(testId: string, studentId: string): Promise<TestAttempt | null>`
  - [ ] Query: `prisma.testAttempt.findFirst({ where: { testId, studentId, submittedAt: { not: null } } })`

- [ ] Task 2: Update `AttemptsService.startTest` in `apps/api/src/services/attempts.service.ts`
  - [ ] After `validateTestAvailability(test)`, add one-attempt check:
    ```ts
    if (test.allowOnlyOneAttempt) {
      const existing = await AttemptsRepository.findCompletedAttemptByTestAndStudent(testId, studentId);
      if (existing) throw new Error("ATTEMPT_ALREADY_EXISTS");
    }
    ```
  - [ ] Remove or replace the commented-out duplicate check (lines 38-41 in current file)

- [ ] Task 3: Update `AttemptsController.startTest` in `apps/api/src/controllers/attempts.controller.ts`
  - [ ] In the catch block for `startTest`, handle `ATTEMPT_ALREADY_EXISTS` error:
    ```ts
    if (error.message === "ATTEMPT_ALREADY_EXISTS") {
      return res.status(409).json({ error: "Siz bu testni allaqachon topshirgansiz", code: "ATTEMPT_ALREADY_EXISTS" });
    }
    ```

- [ ] Task 4: Update bot to handle 409 response
  - [ ] In the bot's `start_unlocked_test` (or equivalent) handler, after calling `POST /api/tests/{testId}/attempts/start`:
  - [ ] If response status is 409: fetch the previous attempt using `GET /api/attempts/student` or the attempt data returned in error body
  - [ ] Display message: "✅ Siz bu testni allaqachon topshirgansiz!\n\nSizning natijangiz: {score} / {maxScore} ({percent}%)"
  - [ ] Show main menu after displaying the result

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

### Completion Notes List

### File List
