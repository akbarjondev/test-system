# Story 8.3: Test-Taking Screen

Status: done

## Story

As a student,
I want to answer questions one at a time with clear navigation,
So that I can complete a test attempt with a focused, distraction-free experience.

## Acceptance Criteria

1. **Given** a student taps "Boshlash" on the test detail screen,
   **When** `POST /api/tests/:testId/attempts/start` is called,
   **Then** the app receives the shuffled question list and displays the first question with answer options as tappable buttons

2. **Given** a student taps an answer option,
   **When** `POST /api/attempts/:attemptId/answers` is called with `{ questionId, optionId }`,
   **Then** the selected option is visually highlighted and locked (no re-selection)
   **And** a "Keyingisi" (Next) button appears to advance to the next question

3. **Given** the student is on question N of M,
   **When** the question renders,
   **Then** a progress indicator shows "N / M savol" at the top of the screen

4. **Given** the student reaches the last question and taps "Keyingisi",
   **When** `POST /api/attempts/:attemptId/submit` is called,
   **Then** the app navigates to the results screen

5. **Given** `submit` returns 403 with `TIME_LIMIT_EXCEEDED`,
   **When** the app handles the error,
   **Then** it navigates to the results screen showing: "⏱ Vaqt tugadi! Javoblaringiz qabul qilinmadi."

6. **Given** the student is mid-test,
   **When** Telegram's Back Button is tapped,
   **Then** a confirmation dialog shows: "Testni tark etmoqchimisiz? Progress saqlanmaydi." with "Ha" and "Yo'q" options

## Tasks / Subtasks

- [ ] Task 1: Add attempts API calls to service (AC: #1, #2, #4, #5)
  - [ ] Create `apps/mini-app/src/services/attempts.ts`
  - [ ] Export `startAttempt(testId: string)` — POST `/api/tests/${testId}/attempts/start`
    - Returns: `{ attemptId: string; questions: AttemptQuestion[] }`
    - `AttemptQuestion`: `{ questionId: string; displayOrder: number; text: string; options: { id: string; text: string; order: number }[] }`
  - [ ] Export `submitAnswer(attemptId: string, questionId: string, optionId: string)` — POST `/api/attempts/${attemptId}/answers`
  - [ ] Export `submitAttempt(attemptId: string)` — POST `/api/attempts/${attemptId}/submit`
    - Returns: `{ score: number; maxScore: number; passed: boolean | null }`
    - On 403 with code `TIME_LIMIT_EXCEEDED`: throw with `{ timedOut: true }` flag

- [ ] Task 2: Create TestTakingScreen component (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Create `apps/mini-app/src/screens/TestTakingScreen.tsx`
  - [ ] Props: `testId: string`, `onComplete(result: AttemptResult): void`, `onTimedOut(): void`
  - [ ] State: `{ attemptId, questions, currentIndex, selectedOptionId, submitting }`
  - [ ] On mount: call `startAttempt(testId)`, store attemptId and questions

- [ ] Task 3: Render question UI (AC: #1, #2, #3)
  - [ ] Show progress: `"{currentIndex + 1} / {questions.length} savol"`
  - [ ] Show question text
  - [ ] Render option buttons — each tappable, becomes highlighted on selection, disabled after selection
  - [ ] After selection: submit answer via `submitAnswer()`, show "Keyingisi" button
  - [ ] "Keyingisi" press: if last question → submit attempt; else → increment currentIndex, clear selectedOptionId

- [ ] Task 4: Handle submit and time limit (AC: #4, #5)
  - [ ] On "Keyingisi" for last question: call `submitAttempt(attemptId)`
  - [ ] On success: call `onComplete(result)` with score/maxScore/passed
  - [ ] On `TIME_LIMIT_EXCEEDED` (403): call `onTimedOut()` — App shows results screen with timeout message

- [ ] Task 5: Implement Back Button with confirmation (AC: #6)
  - [ ] On mount: `WebApp.BackButton.show()` with handler that shows `WebApp.showConfirm("Testni tark etmoqchimisiz? Progress saqlanmaydi.", callback)`
  - [ ] In confirm callback: if user confirms (`ok === true`), navigate to `"tests-list"` (abandon attempt)
  - [ ] On unmount: `WebApp.BackButton.offClick()` + `WebApp.BackButton.hide()`

- [ ] Task 6: Wire into App.tsx (AC: #1, #4, #5)
  - [ ] Navigate to `"test-taking"` when "Boshlash" is tapped on TestDetailScreen
  - [ ] `onComplete(result)`: store result in state, navigate to `"results"` screen
  - [ ] `onTimedOut()`: store `{ timedOut: true }` in result state, navigate to `"results"` screen

## Dev Notes

### File Locations — Create / Modify

| File | Change |
|------|--------|
| `apps/mini-app/src/services/attempts.ts` | Create — attempts API calls |
| `apps/mini-app/src/screens/TestTakingScreen.tsx` | Create |
| `apps/mini-app/src/App.tsx` | Add test-taking screen + result state |

### Start Attempt Response Shape

From `POST /api/tests/:testId/attempts/start` (existing from Epic 2/3). The bot (`apps/telegram-bot/src/bot.ts`) already uses this — check lines 80+ for response shape reference. The API returns shuffled questions with their options. Store the full question list in state.

### Answer Submission — No Wait Required

After `submitAnswer()` resolves, immediately show "Keyingisi" button. The student can tap it to proceed. The API stores answers independently — if a question answer fails to submit (network error), the attempt can still be submitted (submitted answers count toward score; unanswered questions score 0).

### Option Selection — Visual Highlight Pattern

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
const [answered, setAnswered] = useState(false);

// option button:
<button
  key={opt.id}
  disabled={answered}
  onClick={() => handleAnswer(opt.id)}
  style={{
    backgroundColor: selectedId === opt.id ? "var(--tg-button-color)" : undefined,
    color: selectedId === opt.id ? "var(--tg-button-text-color)" : undefined,
    opacity: answered && selectedId !== opt.id ? 0.5 : 1,
  }}
>
  {opt.text}
</button>
```

### WebApp.showConfirm Pattern

`WebApp.showConfirm` is a native Telegram dialog — no custom modal needed:
```ts
WebApp.showConfirm(
  "Testni tark etmoqchimisiz? Progress saqlanmaydi.",
  (ok) => { if (ok) onNavigate("tests-list"); }
);
```

### TIME_LIMIT_EXCEEDED Error Detection

```ts
export async function submitAttempt(attemptId: string) {
  try {
    return await apiFetch<SubmitResult>(`/api/attempts/${attemptId}/submit`, { method: "POST" });
  } catch (err: any) {
    if (err.status === 403 && err.code === "TIME_LIMIT_EXCEEDED") {
      throw Object.assign(err, { timedOut: true });
    }
    throw err;
  }
}
```

In the component, catch `err.timedOut === true` and call `onTimedOut()`.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Existing startAttempt/submitAnswer patterns used by the bot
- [Source: apps/api/src/routes/attempts.ts] — Attempt API endpoints
- [Source: apps/mini-app/src/services/tests.ts] — apiFetch usage pattern (Stories 8.1–8.2)

## Dev Agent Record

### Agent Model Used
claude-sonnet-4.6

### Completion Notes List
- Created `apps/mini-app/src/services/attempts.ts` with `startAttempt()`, `submitAnswer()`, `submitAttempt()` (with TIME_LIMIT_EXCEEDED detection)
- Created `TestTakingScreen` with full question rendering, option selection highlight/lock, answer submission, next/submit flow
- Back Button shows WebApp.showConfirm dialog before abandoning
- On last question button label changes to "Yakunlash"
- Network errors on individual answer submit are swallowed (attempt still submittable)

### File List
- `apps/mini-app/src/services/attempts.ts` (created)
- `apps/mini-app/src/screens/TestTakingScreen.tsx` (created)
- `apps/mini-app/src/App.tsx` (updated)
