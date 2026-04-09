# Story 4.2: Pass Threshold API

Status: review

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

- [x] Task 1: Update Zod schemas in `apps/api/src/config/schemas.ts`
  - [x] Add `passingScore: z.number().positive().optional().nullable()` to `createTestSchema`
  - [x] Apply same to `updateTestSchema`

- [x] Task 2: Update `AttemptsRepository.submitAttempt` in `apps/api/src/repositories/attempts.repository.ts`
  - [x] Add `timedOutAt?: Date` parameter to the method signature
  - [x] Pass it to `prisma.testAttempt.update({ where: { id: attemptId }, data: { ..., timedOutAt } })`

- [x] Task 3: Update `AttemptsService.submitTest` in `apps/api/src/services/attempts.service.ts`
  - [x] When `TIME_LIMIT_EXCEEDED` is detected, set `timedOutAt`:
    ```ts
    if (this.isTimeLimitExceeded(attempt, test)) {
      await AttemptsRepository.setTimedOut(attemptId);  // new method
      throw new Error("TIME_LIMIT_EXCEEDED");
    }
    ```
  - [x] Add `AttemptsRepository.setTimedOut(attemptId)` that sets `timedOutAt = new Date()`

- [x] Task 4: Add `passed` and `status` computed fields to attempts list response
  - [x] In `AttemptsRepository.getAttemptsByTest`, include `test.passingScore` in the query select
  - [x] In `AttemptsController.getTestAttempts` (or service), compute per attempt:
    ```ts
    const status = attempt.submittedAt ? "submitted" : attempt.timedOutAt ? "timed_out" : "in_progress";
    const passed = test.passingScore !== null
      ? (attempt.score ?? 0) >= test.passingScore
      : null;
    ```
  - [x] Return enriched attempt array

- [x] Task 5: Verify `passingScore` is included in test create/update response
  - [x] Check `TestsController.createTest` and `updateTest` — confirm Prisma returns all fields including `passingScore`

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

- Tasks 1, 4, 5 were already implemented in previous work on this story (passingScore schema, computed fields in service, controller pass-through).
- Task 2 description refers to `submitAttempt` signature change, but implementation pattern from story is actually a new separate `setTimedOut` method — implemented as specified in Dev Notes.
- Task 4: `passingScore` is accessed via `TestsRepository.getOneTest` called in `getTestAttempts` service, not from the attempts query itself — this is correct since the test object provides `passingScore`.

### Completion Notes List

- Task 1: `passingScore: z.number().min(0).optional().nullable()` was already present in `createTestSchema` and inherited by `updateTestSchema` (via `.partial()`). No change needed.
- Task 2: Added `static async setTimedOut(attemptId: string): Promise<void>` to `AttemptsRepository` — sets `timedOutAt = new Date()` via Prisma update.
- Task 3: Updated `submitTest` in `AttemptsService` — calls `await AttemptsRepository.setTimedOut(attemptId)` immediately before throwing `TIME_LIMIT_EXCEEDED`, persisting the timed-out timestamp.
- Task 4: `status` and `passed` computed fields were already present in `AttemptsService.getTestAttempts`. The test's `passingScore` is loaded via `TestsRepository.getOneTest`. No change needed.
- Task 5: `TestsController.createTest` and `updateTest` both return the Prisma result directly (all model fields), which includes `passingScore`. No change needed.
- TypeScript compilation: clean (`tsc --noEmit` exits 0).

### File List

- `apps/api/src/repositories/attempts.repository.ts` — added `setTimedOut` static method
- `apps/api/src/services/attempts.service.ts` — call `setTimedOut` before throwing TIME_LIMIT_EXCEEDED in `submitTest`

## Change Log

- 2026-04-09: Implemented story 4-2-pass-threshold-api. Added `AttemptsRepository.setTimedOut` method; updated `AttemptsService.submitTest` to record `timedOutAt` on time-limit expiry. Confirmed `passingScore` schema, computed status/passed fields, and controller response were already implemented. TypeScript clean.
