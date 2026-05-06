# Epic 1: Simplified Student Onboarding

Students can start using the bot instantly — no email or password. Telegram identity and phone number is all they need. The bot never crashes due to Telegram API errors.

### Story 1.1: Telegram Auto-Registration API

As a student,
I want to be automatically registered when I first use the bot,
So that I don't need to create an account manually.

**Acceptance Criteria:**

**Given** a new student sends `/start` for the first time
**When** the bot calls `POST /api/auth/telegram` with `{ telegramId, fullName, phone }`
**Then** the API creates a new User record with role STUDENT, `email` null, and returns `{ token, user }`
**And** `telegramId` and `phone` are stored as unique fields on the User model

**Given** an existing student sends `/start` again
**When** the bot calls `POST /api/auth/telegram` with the same `telegramId`
**Then** the API finds the existing user and returns a fresh `{ token, user }` without creating a duplicate

**Given** the schema migration runs
**When** applied to the existing database
**Then** `User.email` becomes nullable, `User.telegramId`, `User.fullName`, `User.phone` fields are added with unique constraints on `telegramId` and `phone`
**And** the existing admin user record is unaffected

---

### Story 1.2: Bot Onboarding Flow

As a student,
I want the bot to greet me and collect my name and phone number on first use,
So that I can start taking tests without typing a password.

**Acceptance Criteria:**

**Given** a student opens the bot for the first time
**When** they send `/start`
**Then** the bot asks for their full name in Uzbek: "Ismingiz va familiyangizni kiriting:"

**Given** the student enters their full name
**When** the bot receives the text
**Then** the bot requests phone number using Telegram's native contact share button: "Telefon raqamingizni ulashing:" with a `KeyboardButton` requesting contact

**Given** the student shares their phone number via Telegram contact
**When** the bot receives the contact
**Then** the bot calls `POST /api/auth/telegram`, stores the returned token in grammY session, and displays the main menu in Uzbek
**And** subsequent `/start` commands from the same user skip onboarding and go directly to main menu

---

### Story 1.3: Bot Global Error Handling

As a system operator,
I want the bot to never crash due to Telegram API errors,
So that students can always use the bot regardless of network issues or stale callbacks.

**Acceptance Criteria:**

**Given** any unhandled error occurs in a bot handler
**When** the error is thrown
**Then** `bot.catch()` intercepts it, logs the error details, and the bot continues running without restarting

**Given** a student taps an old inline keyboard button (query expired >10 seconds)
**When** `answerCallbackQuery` throws `GrammyError: query is too old`
**Then** the error is caught silently in a try/catch, the bot does not crash, and no error is shown to the student

**Given** any bot callback handler encounters an unexpected error
**When** the error is thrown inside the handler
**Then** the bot sends a generic Uzbek error message: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring." and continues operating

---

### Story 1.4: Clean Messages After Authentication

As a student,
I want old bot messages and buttons to be removed after I log in,
So that the chat stays clean and uncluttered.

**Acceptance Criteria:**

**Given** a student completes the onboarding flow successfully
**When** the bot receives the token from the API
**Then** the bot deletes the previous onboarding message using `ctx.deleteMessage()`
**And** displays the main menu as a fresh message in Uzbek

**Given** `ctx.deleteMessage()` fails (message older than 48 hours or already deleted)
**When** the delete throws a Telegram API error
**Then** the error is caught silently and the main menu is still shown
**And** the bot does not crash

---
