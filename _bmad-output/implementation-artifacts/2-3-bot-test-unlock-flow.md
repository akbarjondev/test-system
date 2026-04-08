# Story 2.3: Bot Test Unlock Flow

Status: ready-for-dev

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

- [ ] Task 1: Add session fields for unlock flow
  - [ ] Add `step` value `"awaiting_test_code"` to session step type
  - [ ] Add `unlockedTestId?: string` to session for storing the test to start

- [ ] Task 2: Handle "Testni boshlash" main menu callback
  - [ ] In the callback handler for "Testni boshlash" button:
  - [ ] Set `session.step = "awaiting_test_code"`
  - [ ] Reply: "Test kodini kiriting (3 ta raqam):"

- [ ] Task 3: Handle text message during `awaiting_test_code` step
  - [ ] In `bot.on("message:text")` handler: check `session.step === "awaiting_test_code"`
  - [ ] Validate input is exactly 3 characters — if not, reply "Iltimos, 3 ta raqam kiriting." and re-prompt
  - [ ] Call `POST /api/tests/unlock` with `Authorization: Bearer ${session.token}` and `{ testPassword: text }`
  - [ ] On 200: store `session.unlockedTestId = data.id`, set `session.step = "ready"`, display test info message with "Boshlash ▶️" inline button
  - [ ] On 404: reply "Noto'g'ri kod. Qayta urinib ko'ring." keep `step = "awaiting_test_code"`
  - [ ] On other error: reply "Xatolik yuz berdi. Qayta urinib ko'ring."

- [ ] Task 4: Format test info message
  - [ ] Build Uzbek message:
    ```
    📝 {test.title}

    ⏱ Vaqt: {timeLimitMinutes} daqiqa
    ❓ Savollar: {questionCount} ta
    ⭐ Har bir savol: {pointsPerQuestion} ball

    Tayyor bo'lsangiz boshlang!
    ```
  - [ ] Note: question count comes from `test.questionCount` if API returns it, otherwise omit
  - [ ] Inline keyboard: `[{ text: "Boshlash ▶️", callback_data: "start_unlocked_test" }]`

- [ ] Task 5: Handle "Boshlash ▶️" callback
  - [ ] Use `session.unlockedTestId` to call `POST /api/tests/{testId}/attempts/start`
  - [ ] Proceed with existing test-taking flow

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

### File List
