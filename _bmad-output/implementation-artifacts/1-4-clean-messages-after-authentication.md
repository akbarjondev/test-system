# Story 1.4: Clean Messages After Authentication

Status: done

## Story

As a student,
I want old bot messages and buttons to be removed after I log in,
So that the chat stays clean and uncluttered.

## Acceptance Criteria

1. **Given** a student completes the onboarding flow successfully,
   **When** the bot receives the token from the API,
   **Then** the bot deletes the previous onboarding message using `ctx.deleteMessage()`
   **And** displays the main menu as a fresh message in Uzbek

2. **Given** `ctx.deleteMessage()` fails (message older than 48 hours or already deleted),
   **When** the delete throws a Telegram API error,
   **Then** the error is caught silently and the main menu is still shown
   **And** the bot does not crash

## Tasks / Subtasks

- [x] Task 1: Delete message after successful contact/phone handling
  - [x] In the `message:contact` handler (from Story 1.2), after receiving the API token:
  - [x] Call `await ctx.deleteMessage()` wrapped in try/catch
  - [x] On success: proceed to show main menu
  - [x] On error (catch): log error silently, still proceed to show main menu

- [x] Task 2: Delete phone request keyboard message
  - [x] Track the message ID of the keyboard request message using `ctx.message.message_id - 1` or by storing it in session
  - [x] Alternative: use `ctx.deleteMessage()` which deletes the contact message itself, and separately delete the bot's prompt message (stored in session.lastBotMessageId)
  - [x] Store the bot's last message ID in session when sending the phone request: `session.lastBotMessageId = (await ctx.reply(...)).message_id`

- [x] Task 3: Use `ctx.api.deleteMessage()` for bot-sent messages
  - [x] For messages the bot sent (prompts, keyboards), use `ctx.api.deleteMessage(ctx.chat.id, session.lastBotMessageId)`
  - [x] Wrap in try/catch — silently ignore failures

- [x] Task 4: Update session type to include `lastBotMessageId`
  - [x] Add `lastBotMessageId?: number` to `SessionData` interface

## Dev Notes

### Critical Architecture Rules

```
contact received → API call → token received
  → try: ctx.api.deleteMessage(chat.id, session.lastBotMessageId)  [delete bot prompt]
  → catch: ignore (silent)
  → try: ctx.deleteMessage()  [delete the contact message itself]
  → catch: ignore (silent)
  → show main menu (always runs regardless of delete outcome)
```

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Add delete calls after auth, track lastBotMessageId in session |

### deleteMessage Pattern

```ts
// Delete bot's own prompt message
try {
  await ctx.api.deleteMessage(ctx.chat!.id, ctx.session.lastBotMessageId!);
} catch {
  // Message already deleted or too old — ignore
}

// Delete user's contact message
try {
  await ctx.deleteMessage();
} catch {
  // Message already deleted or too old — ignore
}
```

### Store Bot Message ID Pattern

```ts
// When sending the phone request prompt:
const sent = await ctx.reply("Telefon raqamingizni ulashing:", { reply_markup: { ... } });
ctx.session.lastBotMessageId = sent.message_id;
```

### Dependency

Story 1.2 (Bot Onboarding Flow) must be implemented first — this story extends the contact handler from 1.2.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Session type, contact handler location

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

- `apps/telegram-bot/src/bot.ts`
