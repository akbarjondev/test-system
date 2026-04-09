# Story 1.2: Bot Onboarding Flow

Status: done

## Story

As a student,
I want the bot to greet me and collect my name and phone number on first use,
So that I can start taking tests without typing a password.

## Acceptance Criteria

1. **Given** a student opens the bot for the first time,
   **When** they send `/start`,
   **Then** the bot asks for their full name in Uzbek: "Ismingizni va familiyangizni kiriting:"

2. **Given** the student enters their full name,
   **When** the bot receives the text,
   **Then** the bot requests phone number using Telegram's native contact share button: "Telefon raqamingizni ulashing:" with a `KeyboardButton` requesting contact

3. **Given** the student shares their phone number via Telegram contact,
   **When** the bot receives the contact,
   **Then** the bot calls `POST /api/auth/telegram`, stores the returned token in grammY session, and displays the main menu in Uzbek
   **And** subsequent `/start` commands from the same user skip onboarding and go directly to main menu

## Tasks / Subtasks

- [x] Task 1: Update grammY session type in `apps/telegram-bot/src/bot.ts`
  - [x] Add `fullName?: string` to session state type for temporary storage during onboarding
  - [x] Add `token?: string` to session state (already used — confirm existing field name)
  - [x] Add `step?: "awaiting_name" | "awaiting_phone" | "ready"` to session to track onboarding progress

- [x] Task 2: Handle `/start` command — check session state
  - [x] If `session.token` exists → skip onboarding, show main menu (call `showMainMenu(ctx)`)
  - [x] If no token → set `session.step = "awaiting_name"`, send message "Ismingizni va familiyangizni kiriting:"
  - [x] Remove all email/password auth logic from `/start` handler

- [x] Task 3: Handle text messages — `awaiting_name` step
  - [x] Add `bot.on("message:text")` handler that checks `session.step === "awaiting_name"`
  - [x] Store `ctx.message.text` as `session.fullName`
  - [x] Set `session.step = "awaiting_phone"`
  - [x] Send phone request with ReplyKeyboardMarkup: `{ keyboard: [[{ text: "📞 Raqamni ulashish", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true }`
  - [x] Message text: "Telefon raqamingizni ulashing:"

- [x] Task 4: Handle contact share — `awaiting_phone` step
  - [x] Add `bot.on("message:contact")` handler
  - [x] Extract `ctx.message.contact.phone_number` and `ctx.from.id` (as string for telegramId)
  - [x] Call `POST /api/auth/telegram` with `{ telegramId: String(ctx.from.id), fullName: session.fullName, phone: ctx.message.contact.phone_number }`
  - [x] On success: store `token` in session, set `session.step = "ready"`, remove keyboard with `ReplyKeyboardRemove`, show main menu
  - [x] On API error: send Uzbek error message "Ro'yxatdan o'tishda xatolik. Qayta urinib ko'ring." and reset `session.step = "awaiting_name"`

- [x] Task 5: Update `showMainMenu` helper (or create it)
  - [x] Display inline keyboard with test-related options in Uzbek
  - [x] Example buttons: "📝 Testlar ro'yxati", "🚪 Chiqish" (already existed, kept as-is)

## Dev Notes

### Critical Architecture Rules

```
/start received
  → check session.token
      → if exists: showMainMenu(ctx)
      → if not: set step = "awaiting_name", ask for name

message:text received (step = "awaiting_name")
  → save fullName to session
  → set step = "awaiting_phone"
  → send contact request keyboard

message:contact received
  → call POST /api/auth/telegram
  → store token in session
  → set step = "ready"
  → show main menu
```

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/telegram-bot/src/bot.ts` | Replace email/password auth with Telegram identity flow |

Do NOT touch: API files, dashboard files, database schema (done in Story 1.1).

### grammY Session Pattern (existing)

```ts
// Session type — add new fields:
interface SessionData {
  token?: string;
  fullName?: string;
  step?: "awaiting_name" | "awaiting_phone" | "ready";
  // ... existing fields
}
```

### Contact Request Keyboard Pattern

```ts
await ctx.reply("Telefon raqamingizni ulashing:", {
  reply_markup: {
    keyboard: [[{ text: "📞 Raqamni ulashish", request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
});
```

### Remove Keyboard Pattern

```ts
await ctx.reply("Xush kelibsiz!", {
  reply_markup: { remove_keyboard: true },
});
```

### API Call Pattern (existing in bot)

```ts
const response = await fetch(`${API_URL}/api/auth/telegram`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ telegramId: String(ctx.from!.id), fullName, phone }),
});
const data = await response.json();
ctx.session.token = data.token;
```

### Dependency

Story 1.1 must be merged first — `POST /api/auth/telegram` endpoint must exist.

### References

- [Source: apps/telegram-bot/src/bot.ts] — Session type, existing auth handlers, API_URL constant
- [Source: apps/api/src/routes/auth.ts] — /telegram route (created in Story 1.1)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Replaced email/password session state fields (`state`, `tempEmail`) with new onboarding fields (`step`, `fullName`)
- Removed `register` and `login` callback query handlers entirely
- Updated `logout` handler to reset to `step = "awaiting_name"` and prompt for name again instead of showing old auth keyboard
- `showMainMenu` already had Uzbek buttons ("📝 Testlar ro'yxati", "🚪 Chiqish") — kept as-is, satisfies acceptance criteria
- TypeScript compiles cleanly with no errors

### File List

- `apps/telegram-bot/src/bot.ts`
