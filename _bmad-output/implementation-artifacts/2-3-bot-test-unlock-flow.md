# Story 2.3: Bot Test Unlock Flow

Status: review

## Story

As a student,
I want to enter a test code in the bot and see test details before starting,
So that I know what I'm about to attempt.

## Acceptance Criteria

1. **Given** a student taps the main menu button "Testni boshlash",
   **When** the bot receives the callback,
   **Then** the bot asks: "Test kodini kiriting (3 ta raqam):"

2. **Given** the student types a 3-digit code,
   **When** the bot calls `POST /api/tests/unlock`,
   **Then** on success, the bot displays test info in Uzbek: title, time limit, question count, points per question, and a "Boshlash ▶️" button

3. **Given** the student enters an incorrect code,
   **When** the API returns 404,
   **Then** the bot replies: "Noto'g'ri kod. Qayta urinib ko'ring." and prompts for the code again

## Tasks / Subtasks

- [x] Task 1: Add session fields for unlock flow
  - [x] Add `step` value `"awaiting_test_code"` to session step type
  - [x] Add `unlockedTestId?: string` to session for storing the test to start

- [x] Task 2: Handle "Testni boshlash" main menu callback
  - [x] In the callback handler for "Testni boshlash" button:
  - [x] Set `session.step = "awaiting_test_code"`
  - [x] Reply: "Test kodini kiriting (3 ta raqam):"

- [x] Task 3: Handle text message during `awaiting_test_code` step
  - [x] In `bot.on("message:text")` handler: check `session.step === "awaiting_test_code"`
  - [x] Validate input is exactly 3 characters — if not, reply "Iltimos, 3 ta raqam kiriting." and re-prompt
  - [x] Call `POST /api/tests/unlock` with `Authorization: Bearer ${session.token}` and `{ testPassword: text }`
  - [x] On 200: store `session.unlockedTestId = data.id`, set `session.step = "ready"`, display test info message with "Boshlash ▶️" inline button
  - [x] On 404: reply "Noto'g'ri kod. Qayta urinib ko'ring." keep `step = "awaiting_test_code"`
  - [x] On other error: reply "Xatolik yuz berdi. Qayta urinib ko'ring."

- [x] Task 4: Format test info message
  - [x] Build Uzbek message:
    ```
    📝 {test.title}

    ⏱ Vaqt: {timeLimitMinutes} daqiqa
    ❓ Savollar: {questionCount} ta
    ⭐ Har bir savol: {pointsPerQuestion} ball

    Tayyor bo'lsangiz boshlang!
    ```
  - [x] Note: question count comes from `test.questionCount` if API returns it, otherwise omit
  - [x] Inline keyboard: `[{ text: "Boshlash ▶️", callback_data: "start_unlocked_test" }]`

- [x] Task 5: Handle "Boshlash ▶️" callback
  - [x] Use `session.unlockedTestId` to call `POST /api/tests/{testId}/attempts/start`
  - [x] Proceed with existing test-taking flow

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Add unlock flow: callback handler, text handler case, test info display |

### API Call Pattern

```ts
// Unlock test
const response = await fetch(`${API_URL}/api/tests/unlock`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ctx.session.token}`,
  },
  body: JSON.stringify({ testPassword: ctx.message.text }),
});

if (response.status === 404) {
  await ctx.reply("Noto'g'ri kod. Qayta urinib ko'ring.");
  return;
}

const test = await response.json();
ctx.session.unlockedTestId = test.id;
```

### Test Info Message Pattern

```ts
const infoMessage = `📝 ${test.title}\n\n⏱ Vaqt: ${test.timeLimitMinutes} daqiqa\n⭐ Har bir savol: ${test.pointsPerQuestion} ball\n\nTayyor bo'lsangiz boshlang!`;

await ctx.reply(infoMessage, {
  reply_markup: {
    inline_keyboard: [[{ text: "Boshlash ▶️", callback_data: "start_unlocked_test" }]],
  },
});
```

### Dependency

Story 2.2 must be merged first — `POST /api/tests/unlock` endpoint must exist.
Story 1.2 must be merged first — session structure and auth flow must be in place.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Session type, existing callback handlers, API_URL

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `"awaiting_test_code"` to the `SessionData.step` union type and `unlockedTestId?: string` field.
- Added "🚀 Testni boshlash" button to `showMainMenu` with callback_data `"start_test_flow"`.
- Added `start_test_flow` callback handler: sets `session.step = "awaiting_test_code"` and prompts for code.
- Added `awaiting_test_code` branch in `bot.on("message:text")`: validates 3-char input, calls `POST /api/tests/unlock`, handles 404 (bad code), other errors, and success (stores `unlockedTestId`, displays formatted test info with "Boshlash ▶️" button).
- Test info message conditionally includes `❓ Savollar` line only when API returns `questionCount`.
- Added `start_unlocked_test` callback handler: reads `session.unlockedTestId`, calls `POST /api/tests/{testId}/attempts/start`, then enters existing question-sending flow.
- TypeScript compilation passes with no errors (`tsc --noEmit`).
- No test framework exists in telegram-bot package; correctness validated via strict TS compilation.

### File List

- apps/telegram-bot/src/bot.ts

### Change Log

- 2026-04-09: Implemented Story 2.3 — bot test unlock flow. Added `awaiting_test_code` session step, `unlockedTestId` session field, `start_test_flow` callback handler, `start_unlocked_test` callback handler, `awaiting_test_code` text message handler branch, and "Testni boshlash" button in main menu. (Amelia)
