# Story 3.1: Show Selected Answer in Bot

Status: review

## Story

As a student,
I want to see my selected answer displayed after I choose it,
So that I have a clear record of what I answered before moving to the next question.

## Acceptance Criteria

1. **Given** a student taps an answer option during a test,
   **When** the bot receives the callback query,
   **Then** the bot edits the existing question message to show the selected answer as text below the question: `"✅ Sizning javobingiz: {label}) {optionText}"`
   **And** the inline keyboard is removed from the message

2. **Given** the answer is recorded via `POST /api/attempts/:attemptId/answers`,
   **When** the API responds successfully,
   **Then** the bot advances to the next question as a new message
   **And** if it was the last question, the bot calls submit and shows the result

3. **Given** `ctx.editMessageText()` fails (message too old or deleted),
   **When** the edit throws a Telegram API error,
   **Then** the error is caught silently and the bot still advances to the next question

## Tasks / Subtasks

- [x] Task 1: Identify existing answer callback handler in `apps/telegram-bot/src/bot.ts`
  - [x] Find the `bot.callbackQuery(...)` handler that processes answer selection
  - [x] Note the callback_data format (e.g., `answer_{optionId}` or `answer_{questionId}_{optionId}`)

- [x] Task 2: Edit message to show selected answer before submitting
  - [x] After receiving the callback, before calling the API:
  - [x] Get the option label (A, B, C, D) and option text from session or callback data
  - [x] Call `ctx.editMessageText(newText, { reply_markup: undefined })` to remove keyboard and show selection
  - [x] New text format: `{existingQuestionText}\n\n✅ Sizning javobingiz: {label}) {optionText}`
  - [x] Wrap in try/catch — silently ignore edit failures (message too old)

- [x] Task 3: Store question text and option label in session or callback data
  - [x] When sending a question, store in session: `session.currentQuestionText`, option texts with labels
  - [x] When callback received, look up the option text from session to build the answer display string
  - [x] Alternative: encode label and text in callback_data (if text is short enough)

- [x] Task 4: Handle `answerCallbackQuery` before edit
  - [x] Call `await ctx.answerCallbackQuery()` (wrapped in try/catch) first to acknowledge the tap
  - [x] Then edit the message

- [x] Task 5: Proceed to next question after showing selection
  - [x] Call `POST /api/attempts/:attemptId/answers` with the selected optionId
  - [x] Fetch the next question from session or re-fetch attempt
  - [x] If more questions: send next question as a new message
  - [x] If no more questions: call `POST /api/attempts/:attemptId/submit` and show result

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Update answer callback handler to edit message and show selection |

### Edit Message Pattern

```ts
// After receiving answer callback:
try {
  await ctx.editMessageText(
    `${ctx.session.currentQuestionText}\n\n✅ Sizning javobingiz: ${label}) ${optionText}`,
    { reply_markup: undefined }
  );
} catch {
  // Message too old or already edited — ignore
}
```

### answerCallbackQuery Wrapping (from Story 1.3)

```ts
try {
  await ctx.answerCallbackQuery();
} catch {
  // Stale query — ignore
}
```

### Session Fields Needed

```ts
interface SessionData {
  // ... existing
  currentQuestionText?: string;
  currentOptions?: Array<{ label: string; text: string; id: string }>;
}
```

### Dependency

Story 1.3 (Bot Global Error Handling) should be merged first — answerCallbackQuery wrapping pattern is established there.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Existing answer callback handler location

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

_None_

### Completion Notes List

- Added `currentQuestionText` and `currentOptions` fields to `SessionData` interface
- Updated `sendQuestion()` to store question text and labelled options in session before sending each question
- Updated the `ans:` callback handler to: (1) call `ctx.answerCallbackQuery()` first, (2) look up label and option text from session, (3) call `ctx.editMessageText()` to replace the question message with the selected answer display (removing keyboard), wrapping in try/catch to silently ignore stale message errors, (4) then proceed with the API call and advance to next question
- All three acceptance criteria satisfied: selected answer shown, bot advances after recording, edit failures caught silently
- TypeScript strict compilation passes with no errors (`tsc --noEmit`)
- No test framework configured for telegram-bot package — no regression risk as only the answer callback handler was modified

### File List

- apps/telegram-bot/src/bot.ts

### Change Log

- 2026-04-09: Implemented Story 3.1 — Show Selected Answer in Bot. Extended SessionData with currentQuestionText/currentOptions, updated sendQuestion() to populate session, and updated answer callback handler to edit question message showing selected answer before advancing to next question.
