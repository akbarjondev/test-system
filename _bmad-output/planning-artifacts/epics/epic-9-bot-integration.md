# Epic 9: Bot Integration

The Telegram bot surfaces the Mini App through a persistent Menu Button. Students no longer need to remember a command — one tap launches the full Mini App experience. Existing bot flows are unaffected.

### Story 9.1: Bot Menu Button for Mini App

As a student,
I want a persistent button in the Telegram bot that opens the Mini App,
So that I can launch the Mini App with one tap without needing to know any bot commands.

**Acceptance Criteria:**

**Given** the Vercel deployment URL is known (from Epic 7)
**When** the bot starts up
**Then** `bot.api.setChatMenuButton()` is called with `{ type: "web_app", text: "Testlar", web_app: { url: MINI_APP_URL } }` using the `MINI_APP_URL` environment variable

**Given** `MINI_APP_URL` is not set in the environment
**When** the bot starts
**Then** it logs a startup warning and falls back to the default menu button (no crash)

**Given** the menu button is configured
**When** a student opens the bot in Telegram
**Then** a "Testlar" button appears in the bottom-left of the message input area
**And** tapping it opens the Mini App at the Vercel URL inside Telegram

**Given** the menu button is added
**When** a student uses any existing bot commands (`/start`, test unlock flow, etc.)
**Then** all existing bot flows work exactly as before — no regressions
**And** `MINI_APP_URL` is documented in `.env.example`
