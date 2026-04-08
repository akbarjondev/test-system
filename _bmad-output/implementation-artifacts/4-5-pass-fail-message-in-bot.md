# Story 4.5: Pass/Fail Message in Bot

Status: ready-for-dev

## Story

As a student,
I want to know whether I passed or failed immediately after submitting a test,
So that I get meaningful feedback on my performance.

## Acceptance Criteria

1. **Given** a student submits a test and the test has `passingScore` set,
   **When** the bot receives the submission result,
   **Then** the result message includes pass/fail status:
   `"🎉 Test yakunlandi!\n\nSizning balingiz: {score} / {maxScore} ({percent}%)\n\n✅ Natija: O'tdingiz!"` or `"❌ Natija: O'tmadingiz."`

2. **Given** a student submits a test with no `passingScore` set,
   **When** the bot receives the submission result,
   **Then** only the score is shown without pass/fail text:
   `"🎉 Test yakunlandi!\n\nSizning balingiz: {score} / {maxScore} ({percent}%)"`

## Tasks / Subtasks

- [ ] Task 1: Update the submit attempt handler in `apps/telegram-bot/src/bot.ts`
  - [ ] Find the handler that calls `POST /api/attempts/:attemptId/submit`
  - [ ] The API response now includes `passed: boolean | null` (from Story 4.2)
  - [ ] Build result message based on `passed`:
    - `passed === true`: append `"\n\n✅ Natija: O'tdingiz!"`
    - `passed === false`: append `"\n\n❌ Natija: O'tmadingiz."`
    - `passed === null`: no pass/fail suffix

- [ ] Task 2: Compute `percent` for display
  - [ ] `percent = Math.round((score / maxScore) * 100)`
  - [ ] `maxScore` comes from API response (`maxPossibleScore` field)
  - [ ] Handle edge case: `maxScore = 0` → show 0%

- [ ] Task 3: Show main menu after result
  - [ ] After sending result message, show main menu inline keyboard

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Update submit result message to include pass/fail |

### Result Message Builder Pattern

```ts
const score = data.totalScore ?? 0;
const maxScore = data.maxPossibleScore ?? 0;
const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

let message = `🎉 Test yakunlandi!\n\nSizning balingiz: ${score} / ${maxScore} (${percent}%)`;

if (data.passed === true) {
  message += "\n\n✅ Natija: O'tdingiz!";
} else if (data.passed === false) {
  message += "\n\n❌ Natija: O'tmadingiz.";
}
// if data.passed === null: no suffix (no passingScore on test)

await ctx.reply(message);
showMainMenu(ctx);
```

### API Response Shape (from Story 4.2)

```ts
// POST /api/attempts/:id/submit response:
{
  id: string;
  score: number;
  totalScore: number;        // same as score
  maxPossibleScore: number;
  passed: boolean | null;    // null if no passingScore on test
  submittedAt: string;
  // ... other attempt fields
}
```

### Dependency

Story 4.2 must be merged first — API must return `passed` field in submit response.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Existing submit result handler location

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
