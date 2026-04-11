# Story 2.2: Test Unlock Endpoint

Status: review

## Story

As a student,
I want to enter a 3-digit code to access a test,
So that I can only take tests the teacher has shared with me.

## Acceptance Criteria

1. **Given** a student calls `POST /api/tests/unlock` with `{ testPassword: "472" }`,
   **When** a test with that password exists,
   **Then** the API returns the test info `{ id, title, description, timeLimitMinutes, pointsPerQuestion, isAlwaysAvailable, availableFrom, availableUntil }`
   **And** the response does not include the testPassword field

2. **Given** a student calls `POST /api/tests/unlock` with a code that matches no test,
   **When** the API processes the request,
   **Then** it returns `{ error: "Test topilmadi", code: "TEST_NOT_FOUND" }` with status 404

3. **Given** the request body is missing `testPassword` or it is not a 3-character string,
   **When** Zod validation runs,
   **Then** the API returns `{ error: "Validation failed", details: [...] }` with status 400

## Tasks / Subtasks

- [x] Task 1: Add Zod schema to `apps/api/src/config/schemas.ts`
  - [x] Add `testUnlockSchema` validating `{ testPassword: z.string().length(3) }`

- [x] Task 2: Add repository method to `apps/api/src/repositories/tests.repository.ts`
  - [x] Add `findByPassword(testPassword: string): Promise<Test | null>` using `prisma.test.findFirst({ where: { testPassword } })`

- [x] Task 3: Add service method to `apps/api/src/services/tests.service.ts`
  - [x] Add `unlockTest(testPassword: string): Promise<Test>` — calls `findByPassword`, throws `Error("TEST_NOT_FOUND")` if null

- [x] Task 4: Add controller method to `apps/api/src/controllers/tests.controller.ts`
  - [x] Add `static async unlockTest(req, res)` — calls `TestsService.unlockTest(req.body.testPassword)`
  - [x] On success: return 200 with `{ id, title, description, timeLimitMinutes, pointsPerQuestion, isAlwaysAvailable, availableFrom, availableUntil }` (exclude testPassword)
  - [x] On `TEST_NOT_FOUND` error: return 404 `{ error: "Test topilmadi", code: "TEST_NOT_FOUND" }`
  - [x] On other error: return 500 `{ error: "Internal server error" }`

- [x] Task 5: Register route in `apps/api/src/routes/tests.ts`
  - [x] Add `router.post("/unlock", validate(testUnlockSchema), verifyTokenMiddleware, TestsController.unlockTest)`
  - [x] Route: `POST /api/tests/unlock`
  - [x] Requires JWT (student must be authenticated) — NO verifyAdmin

## Dev Notes

### Critical Architecture Rules

```
POST /api/tests/unlock
  → validate(testUnlockSchema)     ← Zod: { testPassword: string(3) }
  → verifyTokenMiddleware           ← JWT required (student token)
  → TestsController.unlockTest
      → TestsService.unlockTest
          → TestsRepository.findByPassword
              → Prisma → PostgreSQL
```

This endpoint is for **authenticated students** — requires token, no admin check.

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/api/src/config/schemas.ts` | Add testUnlockSchema |
| `apps/api/src/repositories/tests.repository.ts` | Add findByPassword method |
| `apps/api/src/services/tests.service.ts` | Add unlockTest method |
| `apps/api/src/controllers/tests.controller.ts` | Add unlockTest static method |
| `apps/api/src/routes/tests.ts` | Add POST /unlock route |

### Controller Response Pattern

```ts
static async unlockTest(req: Request, res: Response) {
  try {
    const test = await TestsService.unlockTest(req.body.testPassword);
    const { testPassword: _, ...testData } = test;
    return res.status(200).json(testData);
  } catch (error) {
    if (error instanceof Error && error.message === "TEST_NOT_FOUND") {
      return res.status(404).json({ error: "Test topilmadi", code: "TEST_NOT_FOUND" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### Dependency

Story 2.1 must be merged first — `testPassword` field must exist on Test model.

### References

- [Source: apps/api/src/config/schemas.ts] — Zod schema patterns
- [Source: apps/api/src/repositories/tests.repository.ts] — Repository pattern
- [Source: apps/api/src/services/tests.service.ts] — Service pattern
- [Source: apps/api/src/controllers/tests.controller.ts] — Controller pattern
- [Source: apps/api/src/routes/tests.ts] — Route registration pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

No issues encountered during implementation.

### Completion Notes List

- Implemented `testUnlockSchema` in schemas.ts: `z.object({ testPassword: z.string().length(3) })`
- Added `TestsRepository.findByPassword(testPassword)` using `prisma.test.findFirst({ where: { testPassword } })`
- Added `TestsService.unlockTest(testPassword)` which throws `Error("TEST_NOT_FOUND")` when no test is found
- Added `TestsController.unlockTest(req, res)` with destructured response (testPassword excluded), 404 on TEST_NOT_FOUND, 500 on other errors
- Registered `POST /unlock` route before `POST /` to avoid route conflicts, with validate + verifyTokenMiddleware + controller
- The route file already applies `router.use(verifyTokenMiddleware)` globally; the route also specifies it explicitly per story spec (idempotent)
- All Acceptance Criteria satisfied: AC1 (200 with test data, no testPassword), AC2 (404 TEST_NOT_FOUND), AC3 (400 Zod validation)
- No test framework exists in the project; implementation was validated through TypeScript type checking and code review

### File List

- apps/api/src/config/schemas.ts
- apps/api/src/repositories/tests.repository.ts
- apps/api/src/services/tests.service.ts
- apps/api/src/controllers/tests.controller.ts
- apps/api/src/routes/tests.ts

## Change Log

- 2026-04-09: Story 2.2 implemented by Amelia (claude-sonnet-4-6). Added POST /api/tests/unlock endpoint with full layered implementation (schema, repository, service, controller, route). All 5 tasks complete.
