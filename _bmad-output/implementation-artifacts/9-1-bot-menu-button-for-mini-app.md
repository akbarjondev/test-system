# Story 9.1: Bot Menu Button for Mini App

Status: ready-for-dev

## Story

As a student,
I want a persistent button in the Telegram bot that opens the Mini App,
So that I can launch the Mini App with one tap without needing to know any bot commands.

## Acceptance Criteria

1. **Given** the Vercel deployment URL is known (from Epic 7),
   **When** the bot starts up,
   **Then** `bot.api.setChatMenuButton()` is called with `{ type: "web_app", text: "Testlar", web_app: { url: MINI_APP_URL } }` using the `MINI_APP_URL` environment variable

2. **Given** `MINI_APP_URL` is not set in the environment,
   **When** the bot starts,
   **Then** it logs a startup warning and falls back to the default menu button (no crash)

3. **Given** the menu button is configured,
   **When** a student opens the bot in Telegram,
   **Then** a "Testlar" button appears in the bottom-left of the message input area
   **And** tapping it opens the Mini App at the Vercel URL inside Telegram

4. **Given** the menu button is added,
   **When** a student uses any existing bot commands (`/start`, test unlock flow, etc.),
   **Then** all existing bot flows work exactly as before — no regressions
   **And** `MINI_APP_URL` is documented in `.env.example`

## Tasks / Subtasks

- [ ] Task 1: Read `MINI_APP_URL` from environment (AC: #1, #2)
  - [ ] In `apps/telegram-bot/src/bot.ts`, add after bot initialization:
    ```ts
    const MINI_APP_URL = process.env.MINI_APP_URL;
    ```
  - [ ] No validation in env startup (it's optional — bot works without it)

- [ ] Task 2: Set Chat Menu Button on startup (AC: #1, #2)
  - [ ] After `bot` is created and before `bot.start()`, add:
    ```ts
    if (MINI_APP_URL) {
      bot.api.setChatMenuButton({
        menu_button: {
          type: "web_app",
          text: "Testlar",
          web_app: { url: MINI_APP_URL },
        },
      }).catch((err) => {
        console.error("[startup] Failed to set menu button:", err.message);
      });
    } else {
      console.warn("[startup] MINI_APP_URL not set — menu button not configured");
    }
    ```
  - [ ] `.catch()` prevents startup crash if `setChatMenuButton` API call fails

- [ ] Task 3: Document env var (AC: #4)
  - [ ] Add to `apps/telegram-bot/.env.example` (or root `.env.example` if that's the pattern):
    ```
    # Telegram Mini App menu button URL (Epic 9)
    MINI_APP_URL=https://your-mini-app.vercel.app
    ```

- [ ] Task 4: Verify no regressions (AC: #4)
  - [ ] Read through all existing handler registrations in `apps/telegram-bot/src/bot.ts` — the new code only adds a single startup API call, no handlers changed
  - [ ] Confirm `bot.catch()` (existing global error handler) would catch any menu button errors too
  - [ ] Run local bot with `MINI_APP_URL` unset — confirm startup warning appears and bot still starts

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Add `setChatMenuButton` call after bot init |
| `apps/telegram-bot/.env.example` | Add `MINI_APP_URL` |

**Do NOT modify**: Any existing handlers, session logic, middleware, or route registrations.

### setChatMenuButton API

`bot.api.setChatMenuButton()` is a grammY/Telegram Bot API call. The parameter structure:
```ts
await bot.api.setChatMenuButton({
  menu_button: {
    type: "web_app",
    text: "Testlar",         // button label in Telegram UI
    web_app: { url: MINI_APP_URL },  // must be HTTPS
  },
});
```

When `chat_id` is omitted, it sets the **default** menu button for all chats. This is the correct approach for a bot with a single Mini App.

### Placement in bot.ts

Insert BEFORE `bot.start()` (or `bot.startWebhook()`) but AFTER the bot instance is created and handlers are registered. The call is fire-and-forget — no need to `await` at startup (wrapping in `.catch()` is sufficient):

```ts
// ... all handlers registered above ...

// Set Mini App menu button
const MINI_APP_URL = process.env.MINI_APP_URL;
if (MINI_APP_URL) {
  bot.api.setChatMenuButton({ menu_button: { type: "web_app", text: "Testlar", web_app: { url: MINI_APP_URL } } })
    .catch((err) => console.error("[startup] Menu button setup failed:", err.message));
} else {
  console.warn("[startup] MINI_APP_URL not set — skipping menu button setup");
}

// Start bot
bot.start();
```

### HTTPS Requirement

Telegram requires the Mini App URL to use HTTPS. The Vercel deployment from Story 7.4 provides HTTPS automatically. For local development, a tunnel (ngrok) is needed — document this in dev setup notes.

### No console.log Rule

Per CLAUDE.md: no `console.log` in committed code. Use `console.error` for errors and `console.warn` for warnings — these are acceptable for operational logging in production. The `console.error` in bot startup for errors is appropriate.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Full bot file to understand insertion point
- [Source: _bmad-output/implementation-artifacts/7-4-vercel-deployment-api-cors.md] — MINI_APP_URL origin (Vercel URL from Epic 7)
- [Source: https://core.telegram.org/bots/api#setchatmenubutton] — Telegram Bot API setChatMenuButton spec

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
