# Story 8.2: Test Unlock Screen

Status: done

## Story

As a student,
I want to enter a 3-digit code to unlock a specific test,
So that I can only access tests my teacher has shared with me.

## Acceptance Criteria

1. **Given** a student taps "Ochish" on a test row,
   **When** the unlock screen renders,
   **Then** a numeric input field is shown with label "Test kodini kiriting:" and a "Tasdiqlash" button

2. **Given** the student enters a correct 3-digit code and taps "Tasdiqlash",
   **When** `POST /api/tests/unlock` is called with `{ testPassword: code }`,
   **Then** on success, the app navigates to the test detail/start screen showing: title, question count, time limit, and a "Boshlash" button

3. **Given** the student enters an incorrect code,
   **When** the API returns 404,
   **Then** an inline error shows: "Noto'g'ri kod. Qayta urinib ko'ring."
   **And** the input is cleared for retry

4. **Given** the test has no password (`testPassword` is null),
   **When** the student taps "Ochish",
   **Then** the app skips the unlock screen and goes directly to the test detail/start screen

5. **Given** the student is on the unlock screen,
   **When** they tap Telegram's Back Button,
   **Then** they return to the tests list screen

## Tasks / Subtasks

- [ ] Task 1: Add unlock API call to tests service (AC: #2, #3)
  - [ ] Add `async function unlockTest(testPassword: string)` to `apps/mini-app/src/services/tests.ts`
  - [ ] POST `{ testPassword }` to `/api/tests/unlock` using `apiFetch`
  - [ ] Returns the unlocked test info: `{ id, title, description, timeLimitMinutes, pointsPerQuestion, isAlwaysAvailable, availableFrom, availableUntil }`
  - [ ] On 404: throw error with recognizable code for caller

- [ ] Task 2: Handle no-password skip logic in App.tsx (AC: #4)
  - [ ] When `onSelectTest(test)` is called from TestsListScreen:
    - If `test.testPassword === null`: navigate directly to `"test-detail"` screen (bypass unlock)
    - Else: navigate to `"test-unlock"` screen
  - [ ] Store selected test in App state

- [ ] Task 3: Create TestUnlockScreen component (AC: #1, #2, #3, #5)
  - [ ] Create `apps/mini-app/src/screens/TestUnlockScreen.tsx`
  - [ ] Props: `test: TestItem`, `onUnlocked(unlockedTest): void`, `onBack(): void`
  - [ ] Render: label "Test kodini kiriting:", numeric input (maxLength 3), "Tasdiqlash" button
  - [ ] On submit: call `unlockTest(code)`, navigate to test detail on success, show inline error on 404
  - [ ] Loading state: disable button while request in flight

- [ ] Task 4: Create TestDetailScreen component (AC: #2, #4)
  - [ ] Create `apps/mini-app/src/screens/TestDetailScreen.tsx`
  - [ ] Props: `test: UnlockedTest`, `onStart(): void`, `onBack(): void`
  - [ ] Display: title, `_count.questions` or question count from unlock response, time limit, points per question
  - [ ] "Boshlash" button calls `onStart()`
  - [ ] Telegram Back Button: navigate back to unlock or tests list

- [ ] Task 5: Implement Telegram Back Button (AC: #5)
  - [ ] Same pattern as Story 8.1: `WebApp.BackButton.show()` on mount, `offClick` + `hide()` on unmount
  - [ ] Back navigates to `"tests-list"` screen

- [ ] Task 6: Wire into App.tsx (AC: #2, #4)
  - [ ] Add `"test-unlock"` and `"test-detail"` screens to state machine
  - [ ] Handle `onUnlocked`: store unlocked test in state, navigate to `"test-detail"`

## Dev Notes

### File Locations — Create / Modify

| File | Change |
|------|--------|
| `apps/mini-app/src/services/tests.ts` | Add `unlockTest()` function |
| `apps/mini-app/src/screens/TestUnlockScreen.tsx` | Create |
| `apps/mini-app/src/screens/TestDetailScreen.tsx` | Create |
| `apps/mini-app/src/App.tsx` | Add unlock/detail screens + no-password skip logic |

### POST /api/tests/unlock

Existing endpoint from Epic 2 (Story 2.2). Accepts `{ testPassword: string }`. Returns test info on 200, `{ error: "Test topilmadi", code: "TEST_NOT_FOUND" }` on 404. The Zod schema (`testUnlockSchema`) already validates 3-digit numeric string — enforce same on the client input (maxLength=3, pattern=`\d{3}`).

### Numeric Input Pattern

```tsx
<input
  type="number"
  inputMode="numeric"
  pattern="\d{3}"
  maxLength={3}
  value={code}
  onChange={(e) => setCode(e.target.value.slice(0, 3))}
  placeholder="000"
/>
```

Use `inputMode="numeric"` for mobile numeric keyboard. Validate client-side: only enable "Tasdiqlash" when `code.length === 3`.

### Error Detection from apiFetch

`apiFetch` throws an error with `.status` and `.code` properties. Detect 404:
```ts
try {
  const test = await unlockTest(code);
  onUnlocked(test);
} catch (err: any) {
  if (err.status === 404) setError("Noto'g'ri kod. Qayta urinib ko'ring.");
  else setError("Xatolik yuz berdi. Qayta urinib ko'ring.");
  setCode(""); // clear input
}
```

### Screen State Tip

By this story, App.tsx manages: `"loading"`, `"error"`, `"home"`, `"tests-list"`, `"test-unlock"`, `"test-detail"`. Keep state as a union type:
```ts
type Screen = "loading" | "error" | "home" | "tests-list" | "test-unlock" | "test-detail" | "test-taking" | "results";
```
Define it once — future stories just add new values.

### References

- [Source: apps/api/src/routes/tests.ts] — POST /api/tests/unlock endpoint (Epic 2)
- [Source: apps/mini-app/src/services/tests.ts] — getTests() function (Story 8.1) to extend
- [Source: apps/mini-app/src/screens/TestsListScreen.tsx] — Back Button pattern to reuse

## Dev Agent Record

### Agent Model Used
claude-sonnet-4.6

### Completion Notes List
- Added `unlockTest()` to `apps/mini-app/src/services/tests.ts`
- Created `TestUnlockScreen` with numeric input, 404 detection, inline error, loading state
- Created `TestDetailScreen` showing test info from `TestItem` (has `_count.questions`)
- Updated `App.tsx`: no-password tests skip directly to test-detail; unlock navigates to test-detail; back from test-detail handles both paths
- TestDetailScreen uses `TestItem` (not a separate UnlockedTest type) since it carries all needed info

### File List
- `apps/mini-app/src/services/tests.ts` (unlockTest added)
- `apps/mini-app/src/screens/TestUnlockScreen.tsx` (created)
- `apps/mini-app/src/screens/TestDetailScreen.tsx` (created)
- `apps/mini-app/src/App.tsx` (updated)
