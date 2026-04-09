# Story 1.3: Bot Global Error Handling

Status: done

## Story

As a system operator,
I want the bot to never crash due to Telegram API errors,
So that students can always use the bot regardless of network issues or stale callbacks.

## Acceptance Criteria

1. **Given** any unhandled error occurs in a bot handler,
   **When** the error is thrown,
   **Then** `bot.catch()` intercepts it, logs the error details, and the bot continues running without restarting

2. **Given** a student taps an old inline keyboard button (query expired >10 seconds),
   **When** `answerCallbackQuery` throws `GrammyError: query is too old`,
   **Then** the error is caught silently in a try/catch, the bot does not crash, and no error is shown to the student

3. **Given** any bot callback handler encounters an unexpected error,
   **When** the error is thrown inside the handler,
   **Then** the bot sends a generic Uzbek error message: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring." and continues operating

## Tasks / Subtasks

- [x] Task 1: Add `bot.catch()` global error handler in `apps/telegram-bot/src/bot.ts`
  - [x] Add `bot.catch((err) => { ... })` after bot initialization, before `bot.start()`
  - [x] Inside catch: log `err.error` (GrammyError details) using `console.error` (logging is acceptable in error boundaries — not regular console.log)
  - [x] Try to send user a generic Uzbek error: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring."
  - [x] Wrap the reply itself in try/catch to prevent double-failure crash

- [x] Task 2: Wrap all existing `answerCallbackQuery` calls in try/catch
  - [x] Search for all `ctx.answerCallbackQuery(...)` calls in bot.ts
  - [x] Wrap each in: `try { await ctx.answerCallbackQuery(...) } catch { /* stale query — ignore */ }`
  - [x] Do NOT remove the answerCallbackQuery calls — just wrap them

- [x] Task 3: Wrap all existing inline callback handlers in try/catch
  - [x] Each `bot.callbackQuery(...)` handler body should be wrapped in `try { ... } catch (error) { ... }`
  - [x] In catch block: log error (console.error), try to send Uzbek error message to user
  - [x] Ensure the catch does not re-throw (which would propagate to bot.catch and cause double message)

- [x] Task 4: Verify bot startup error handling
  - [x] Confirm `bot.start()` is called in a try/catch or with `.catch()` chaining
  - [x] On startup failure: log error and exit process (this is the correct behavior — only runtime errors should be swallowed)

## Dev Notes

### Critical Architecture Rules

```
bot.catch (global boundary)
  ← catches any error not caught by individual handlers
  ← logs the error
  ← attempts to notify user
  ← NEVER re-throws (would crash bot)

Individual handler try/catch
  ← wraps the handler body
  ← catches answerCallbackQuery stale errors
  ← sends user-friendly Uzbek message
  ← does NOT re-throw (prevents reaching bot.catch and double-message)
```

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Add bot.catch + wrap all handlers in try/catch |

### bot.catch Pattern

```ts
bot.catch((err) => {
  console.error("Bot error:", err.error);
  try {
    err.ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
  } catch {
    // ignore reply failure
  }
});
```

### answerCallbackQuery Wrapping Pattern

```ts
// Before:
await ctx.answerCallbackQuery("✓ Javob qabul qilindi");

// After:
try {
  await ctx.answerCallbackQuery("✓ Javob qabul qilindi");
} catch {
  // Query expired — ignore silently
}
```

### Handler try/catch Pattern

```ts
bot.callbackQuery("some_action", async (ctx) => {
  try {
    // ... handler logic
  } catch (error) {
    console.error("Handler error:", error);
    try {
      await ctx.reply("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } catch {
      // ignore reply failure
    }
  }
});
```

### Why console.error is OK Here

NFR5 bans `console.log` in committed code. `console.error` in error boundaries is acceptable — this is observability, not debug logging. The rule targets debug-style logging.

### References

- [Source: apps/telegram-bot/src/bot.ts] — All existing handlers to wrap
- [Source: _bmad-output/planning-artifacts/epics.md] — FR9, NFR7

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

- `apps/telegram-bot/src/bot.ts` — Added `bot.catch()` global error handler; wrapped all `answerCallbackQuery` calls in try/catch; wrapped all `bot.callbackQuery` handler bodies in try/catch; updated `bot.start()` with `.catch()` for startup failure handling
