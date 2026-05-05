# Story 8.4: Results Screen

Status: ready-for-dev

## Story

As a student,
I want to see my score and pass/fail result immediately after submitting,
So that I get clear feedback on my performance.

## Acceptance Criteria

1. **Given** the test is submitted successfully,
   **When** the results screen renders,
   **Then** it displays: "🎉 Test yakunlandi!" with the score `{score} / {maxScore} ({percent}%)`

2. **Given** the test has a `passingScore` set and the student passed,
   **When** the results screen renders,
   **Then** it shows: "✅ Natija: O'tdingiz!" in green

3. **Given** the test has a `passingScore` set and the student did not pass,
   **When** the results screen renders,
   **Then** it shows: "❌ Natija: O'tmadingiz." in red

4. **Given** the test has no `passingScore`,
   **When** the results screen renders,
   **Then** only the score is shown, with no pass/fail indicator

5. **Given** the student views the results screen,
   **When** they tap "Bosh sahifaga qaytish",
   **Then** they are navigated back to the home screen
   **And** Telegram's Back Button is hidden on this screen (result is a terminal state)

## Tasks / Subtasks

- [ ] Task 1: Define AttemptResult type (AC: #1, #2, #3, #4)
  - [ ] Create or extend `apps/mini-app/src/types.ts` (or inline in App.tsx if small)
  - [ ] Type: `{ score: number; maxScore: number; passed: boolean | null; timedOut?: boolean }`
  - [ ] `passed: null` means no passingScore was set on the test
  - [ ] `timedOut: true` means the attempt was rejected by TIME_LIMIT_EXCEEDED

- [ ] Task 2: Create ResultsScreen component (AC: #1, #2, #3, #4, #5)
  - [ ] Create `apps/mini-app/src/screens/ResultsScreen.tsx`
  - [ ] Props: `result: AttemptResult`, `onHome(): void`
  - [ ] Render cases:
    - `timedOut === true`: show "⏱ Vaqt tugadi! Javoblaringiz qabul qilinmadi." (no score)
    - Otherwise: show "🎉 Test yakunlandi!" + score line
  - [ ] Score line: `"{score} / {maxScore} ({percent}%)"` where `percent = Math.round(score / maxScore * 100)`
  - [ ] Pass/fail: only when `passed !== null` — green "✅ Natija: O'tdingiz!" or red "❌ Natija: O'tmadingiz."
  - [ ] "Bosh sahifaga qaytish" button → calls `onHome()`

- [ ] Task 3: Hide Telegram Back Button (AC: #5)
  - [ ] On mount: `WebApp.BackButton.hide()` — results is a terminal screen, no back navigation
  - [ ] No need to `offClick` since Back Button is hidden

- [ ] Task 4: Reset state on home navigation (AC: #5)
  - [ ] In App.tsx, `onHome()` handler: clear `selectedTest`, `result`, `attemptId` state; navigate to `"home"`
  - [ ] This ensures a fresh start if the student takes another test

- [ ] Task 5: Handle timed-out result from TestTakingScreen (AC: #5 from Story 8.3)
  - [ ] In App.tsx, `onTimedOut()`: set result state to `{ score: 0, maxScore: 0, passed: null, timedOut: true }`; navigate to `"results"`
  - [ ] ResultsScreen already handles `timedOut` flag in Task 2

## Dev Notes

### File Locations — Create / Modify

| File | Change |
|------|--------|
| `apps/mini-app/src/screens/ResultsScreen.tsx` | Create |
| `apps/mini-app/src/App.tsx` | Add results screen + reset logic |
| `apps/mini-app/src/types.ts` | Create (or add to existing) — shared types |

### submit Response — passed Field

`POST /api/attempts/:attemptId/submit` returns (from Epic 4, Story 4.2):
```ts
{
  score: number;
  maxScore: number;
  passed: boolean | null;  // null if no passingScore on the test
  // possibly more fields
}
```
The `passed` field is computed server-side. The Mini App does NOT need to recompute it.

### Percent Calculation

```ts
const percent = result.maxScore > 0
  ? Math.round((result.score / result.maxScore) * 100)
  : 0;
```
Guard against division by zero if maxScore is 0 (edge case: test with no questions).

### Color for Pass/Fail

Use Telegram theme CSS variables or inline colors:
- Pass: `color: "#4CAF50"` (or `var(--tg-button-color)` if it fits)
- Fail: `color: "#F44336"`

If CSS variables for success/error were set up in Story 7.1, use them. Otherwise inline colors are acceptable.

### ResultsScreen Full Example

```tsx
export function ResultsScreen({ result, onHome }: Props) {
  useEffect(() => { WebApp.BackButton.hide(); }, []);

  const percent = result.maxScore > 0
    ? Math.round((result.score / result.maxScore) * 100)
    : 0;

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      {result.timedOut ? (
        <p>⏱ Vaqt tugadi! Javoblaringiz qabul qilinmadi.</p>
      ) : (
        <>
          <h2>🎉 Test yakunlandi!</h2>
          <p>{result.score} / {result.maxScore} ({percent}%)</p>
          {result.passed === true && <p style={{ color: "#4CAF50" }}>✅ Natija: O'tdingiz!</p>}
          {result.passed === false && <p style={{ color: "#F44336" }}>❌ Natija: O'tmadingiz.</p>}
        </>
      )}
      <button onClick={onHome}>Bosh sahifaga qaytish</button>
    </div>
  );
}
```

### References

- [Source: apps/api/src/routes/attempts.ts] — submit endpoint response (Epic 4)
- [Source: _bmad-output/implementation-artifacts/8-3-test-taking-screen.md] — AttemptResult type and timedOut flag
- [Source: _bmad-output/implementation-artifacts/4-5-pass-fail-message-in-bot.md] — Bot pass/fail message pattern (same logic, different UI)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
