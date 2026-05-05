# Story 8.1: Tests List Screen

Status: ready-for-dev

## Story

As a student,
I want to see a list of tests I can take in the Mini App,
So that I know what's available and can choose which to unlock.

## Acceptance Criteria

1. **Given** an authenticated student taps "Testlarga o'tish" from the home screen,
   **When** the tests list screen loads,
   **Then** it calls `GET /api/tests` with the student's JWT and displays each test's title, time limit, and points per question
   **And** each test row has an "Ochish" (Unlock) button

2. **Given** no tests are available,
   **When** the screen renders,
   **Then** an empty state message shows: "Hozircha testlar mavjud emas."

3. **Given** the API call fails (network error or 401),
   **When** the screen handles the error,
   **Then** a retry button is shown with message: "Testlarni yuklashda xatolik yuz berdi."

4. **Given** the student is on the tests list screen,
   **When** Telegram's Back Button is visible,
   **Then** tapping it navigates back to the home screen

## Tasks / Subtasks

- [ ] Task 1: Create tests API service (AC: #1)
  - [ ] Create `apps/mini-app/src/services/tests.ts`
  - [ ] Export `async function getTests()` — calls `GET /api/tests` using `apiFetch` from `src/lib/api.ts`
  - [ ] Return typed array: `{ id: string; title: string; timeLimitMinutes: number | null; pointsPerQuestion: number; testPassword: string | null; _count: { questions: number } }[]`

- [ ] Task 2: Create TestsListScreen component (AC: #1, #2, #3, #4)
  - [ ] Create `apps/mini-app/src/screens/TestsListScreen.tsx`
  - [ ] On mount: fetch tests, store in state, handle loading/error states
  - [ ] Loading: show "Yuklanmoqda..." or spinner
  - [ ] Error: show "Testlarni yuklashda xatolik yuz berdi." with "Qayta urinish" button
  - [ ] Empty: show "Hozircha testlar mavjud emas."
  - [ ] Loaded: render list of test cards (see card pattern below)

- [ ] Task 3: Implement test card UI (AC: #1)
  - [ ] Each card shows:
    - Test title (bold)
    - Time limit: `{n} daqiqa` or "Cheksiz" if null
    - Points per question: `Har savol uchun: {n} ball`
    - Question count if available from `_count.questions`
    - "Ochish" button
  - [ ] "Ochish" button calls `onSelectTest(test)` prop

- [ ] Task 4: Implement Telegram Back Button (AC: #4)
  - [ ] On mount: `WebApp.BackButton.show()` and `WebApp.BackButton.onClick(() => onNavigate("home"))`
  - [ ] On unmount: `WebApp.BackButton.hide()` and remove listener

- [ ] Task 5: Wire into App.tsx (AC: #1, #4)
  - [ ] Add `"tests-list"` screen case to App state machine
  - [ ] Pass `onNavigate` and `onSelectTest` props
  - [ ] Store selected test in App state for use by unlock screen

## Dev Notes

### File Locations — Create / Modify

| File | Change |
|------|--------|
| `apps/mini-app/src/services/tests.ts` | Create — tests API calls |
| `apps/mini-app/src/screens/TestsListScreen.tsx` | Create — tests list UI |
| `apps/mini-app/src/App.tsx` | Modify — add tests-list screen case |

### GET /api/tests Response Shape

From the existing API (`apps/api/src/routes/tests.ts`), `GET /api/tests` returns an array of test objects. The student JWT (STUDENT role) is accepted by `verifyTokenMiddleware`. The response includes all published tests. Expected shape per test:
```ts
{
  id: string;
  title: string;
  description: string | null;
  timeLimitMinutes: number | null;
  pointsPerQuestion: number;
  testPassword: string | null;  // presence indicates a password-protected test
  isAlwaysAvailable: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  _count: { questions: number };
}
```

### Telegram Back Button Pattern

```ts
import WebApp from "@twa-dev/sdk";
import { useEffect } from "react";

// In component:
useEffect(() => {
  WebApp.BackButton.show();
  const handler = () => onNavigate("home");
  WebApp.BackButton.onClick(handler);
  return () => {
    WebApp.BackButton.offClick(handler);
    WebApp.BackButton.hide();
  };
}, [onNavigate]);
```

Always clean up with `offClick` and `hide()` in the return of `useEffect` to prevent memory leaks and ghost handlers.

### Test Card — Password Indicator

If `test.testPassword !== null`, the student must enter a code. The "Ochish" button text can remain "Ochish" for both cases — the unlock screen (Story 8.2) handles the password-required vs. skip logic.

### apiFetch Error Handling

`apiFetch` throws on non-2xx responses. Catch in component:
```tsx
useEffect(() => {
  getTests()
    .then(setTests)
    .catch(() => setError(true))
    .finally(() => setLoading(false));
}, []);
```

### References

- [Source: apps/mini-app/src/lib/api.ts] — apiFetch helper (created in Story 7.3)
- [Source: apps/api/src/routes/tests.ts] — GET /api/tests route (existing)
- [Source: apps/mini-app/src/screens/HomeScreen.tsx] — Screen structure pattern to follow

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
