# Story 4.2: Pass Threshold API

Status: ready-for-dev

## Story

As a teacher,
I want to set a passing score when creating or editing a test,
So that the system can automatically determine if a student passed.

## Acceptance Criteria

1. **Given** a teacher calls `POST /api/tests` or `PUT /api/tests/:id` with `passingScore: 70`,
   **When** the API processes the request,
   **Then** `passingScore` is validated (positive Float or null) and persisted
   **And** the response includes `passingScore` in the returned test object

2. **Given** the submit endpoint `POST /api/attempts/:attemptId/submit` is called when time has expired,
   **When** `now > attempt.startedAt + test.timeLimitMinutes`,
   **Then** the API sets `attempt.timedOutAt = now()` before returning the 403 error

3. **Given** `GET /api/tests/:testId/attempts` is called by an admin,
   **When** the API returns the attempts list,
   **Then** each attempt includes a computed `status` field: `"submitted"`, `"timed_out"`, or `"in_progress"`
   **And** each attempt includes `passed: boolean | null` — true if score >= passingScore, false if score < passingScore, null if passingScore not set

## Tasks / Subtasks

- [ ] Task 1: Update Zod schemas in `apps/api/src/config/schemas.ts`
  - [ ] Add `passingScore: z.number().positive().optional().nullable()` to `createTestSchema`
  - [ ] Apply same to `updateTestSchema`

- [ ] Task 2: Update `AttemptsRepository.submitAttempt` in `apps/api/src/repositories/attempts.repository.ts`
  - [ ] Add `timedOutAt?: Date` parameter to the method signature
  - [ ] Pass it to `prisma.testAttempt.update({ where: { id: attemptId }, data: { ..., timedOutAt } })`

- [ ] Task 3: Update `AttemptsService.submitTest` in `apps/api/src/services/attempts.service.ts`
  - [ ] When `TIME_LIMIT_EXCEEDED` is detected, set `timedOutAt`:
    ```ts
    if (this.isTimeLimitExceeded(attempt, test)) {
      await AttemptsRepository.setTimedOut(attemptId);  // new method
      throw new Error("TIME_LIMIT_EXCEEDED");
    }
    ```
  - [ ] Add `AttemptsRepository.setTimedOut(attemptId)` that sets `timedOutAt = new Date()`

- [ ] Task 4: Add `passed` and `status` computed fields to attempts list response
  - [ ] In `AttemptsRepository.getAttemptsByTest`, include `test.passingScore` in the query select
  - [ ] In `AttemptsController.getTestAttempts` (or service), compute per attempt:
    ```ts
    const status = attempt.submittedAt ? "submitted" : attempt.timedOutAt ? "timed_out" : "in_progress";
    const passed = test.passingScore !== null
      ? (attempt.score ?? 0) >= test.passingScore
      : null;
    ```
  - [ ] Return enriched attempt array

- [ ] Task 5: Verify `passingScore` is included in test create/update response
  - [ ] Check `TestsController.createTest` and `updateTest` — confirm Prisma returns all fields including `passingScore`

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/api/src/config/schemas.ts` | Add passingScore to createTestSchema, updateTestSchema |
| `apps/api/src/repositories/attempts.repository.ts` | Add setTimedOut method |
| `apps/api/src/services/attempts.service.ts` | Call setTimedOut before throwing TIME_LIMIT_EXCEEDED |
| `apps/api/src/controllers/attempts.controller.ts` | Add status + passed to attempts list response |

### setTimedOut Repository Method

```ts
static async setTimedOut(attemptId: string): Promise<void> {
  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: { timedOutAt: new Date() },
  });
}
```

### Computed Fields Pattern

```ts
// In controller or service, after fetching attempts:
const enrichedAttempts = attempts.map((attempt) => ({
  ...attempt,
  status: attempt.submittedAt
    ? "submitted"
    : attempt.timedOutAt
    ? "timed_out"
    : "in_progress",
  passed:
    test.passingScore !== null && test.passingScore !== undefined
      ? (attempt.score ?? 0) >= test.passingScore
      : null,
}));
```

### Dependency

Story 4.1 must be merged first — `passingScore` and `timedOutAt` must exist in schema.
Story 3.2 (Time Limit Enforcement) adds the 403 response — this story adds `timedOutAt` recording.

### References

- [Source: apps/api/src/config/schemas.ts] — createTestSchema pattern
- [Source: apps/api/src/repositories/attempts.repository.ts] — submitAttempt method
- [Source: apps/api/src/services/attempts.service.ts] — submitTest, isTimeLimitExceeded

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
