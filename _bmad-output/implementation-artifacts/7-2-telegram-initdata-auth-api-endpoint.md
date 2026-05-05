# Story 7.2: Telegram initData Auth API Endpoint

Status: ready-for-dev

## Story

As a student,
I want the API to recognize me from my Telegram identity,
So that I can authenticate without entering a username or password.

## Acceptance Criteria

1. **Given** a valid `POST /api/auth/telegram-miniapp` request with `{ initData: string }`,
   **When** the API processes it,
   **Then** it validates `initData` using HMAC-SHA256 with `BOT_TOKEN` as the secret key per the Telegram Bot API spec
   **And** if the student does not exist, creates a new User with role STUDENT, storing `telegramId` and `fullName` from `initData`
   **And** returns `{ token, user: { id, fullName, telegramId } }`

2. **Given** `initData` was issued more than 24 hours ago,
   **When** the API validates it,
   **Then** it returns `{ error: "Auth data expired", code: "INIT_DATA_EXPIRED" }` with status 401

3. **Given** `initData` signature does not match,
   **When** the API validates it,
   **Then** it returns `{ error: "Invalid auth data", code: "INIT_DATA_INVALID" }` with status 401

4. **Given** a student calls the endpoint a second time,
   **When** their `telegramId` already exists in the database,
   **Then** the API finds the existing user and returns a fresh token without creating a duplicate
   **And** the Zod schema for this endpoint body is added to `apps/api/src/config/schemas.ts`

## Tasks / Subtasks

- [ ] Task 1: Add Zod schema to schemas.ts (AC: #4)
  - [ ] Add `telegramMiniAppAuthSchema` to `apps/api/src/config/schemas.ts`:
    ```ts
    export const telegramMiniAppAuthSchema = z.object({
      initData: z.string().min(1),
    });
    ```

- [ ] Task 2: Implement initData validation service (AC: #1, #2, #3)
  - [ ] Create validation logic in `apps/api/src/services/users.service.ts` (or a new `apps/api/src/services/telegram-miniapp.service.ts`)
  - [ ] Parse `initData` URL-encoded string into key-value pairs
  - [ ] Extract `hash` field, remove it from the data, sort remaining pairs alphabetically, join with `\n`
  - [ ] Derive secret key: `HMAC-SHA256("WebAppData", BOT_TOKEN)` using Node.js `crypto` module
  - [ ] Compute `HMAC-SHA256(data_check_string, secret_key)` and compare to `hash`
  - [ ] Extract `auth_date` from initData and reject if `Date.now()/1000 - auth_date > 86400` (24h)
  - [ ] Parse `user` JSON field from initData to extract `id` (telegramId) and `first_name`/`last_name` for fullName

- [ ] Task 3: Add controller method (AC: #1, #2, #3, #4)
  - [ ] Add `static async telegramMiniAppAuth(req, res)` to `apps/api/src/controllers/users.controller.ts`
  - [ ] Call validation service; on failure return 401 with appropriate error/code
  - [ ] Call `UsersService.findOrCreateByTelegramMiniApp({ telegramId, fullName })` — no phone needed (Mini App doesn't provide it)
  - [ ] Generate token via `generateToken(user)` from `@test-system/shared/auth`
  - [ ] Return `{ token, user: { id, fullName, telegramId } }` with status 200

- [ ] Task 4: Add service method (AC: #1, #4)
  - [ ] Add `static async findOrCreateByTelegramMiniApp(data: { telegramId: string; fullName: string })` to `apps/api/src/services/users.service.ts`
  - [ ] Reuse `UsersRepository.findByTelegramId(telegramId)` (already exists)
  - [ ] If not found, call `UsersRepository.createTelegramUser({ telegramId, fullName, phone: null })` — check if `phone` is nullable on User model; it should be based on Epic 1 migration

- [ ] Task 5: Register route (AC: #1)
  - [ ] Add to `apps/api/src/routes/auth.ts`:
    ```ts
    router.post("/telegram-miniapp", validate(telegramMiniAppAuthSchema), UsersController.telegramMiniAppAuth);
    ```
  - [ ] Import `telegramMiniAppAuthSchema` from schemas

- [ ] Task 6: Add BOT_TOKEN to env validation (AC: #1)
  - [ ] Add `TELEGRAM_BOT_TOKEN` to required env vars in `apps/api/src/config/env.ts` — or handle gracefully if missing (warn, don't crash, to not break non-bot deployments)
  - [ ] Read `process.env.TELEGRAM_BOT_TOKEN` in the validation service

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/api/src/config/schemas.ts` | Add `telegramMiniAppAuthSchema` |
| `apps/api/src/routes/auth.ts` | Add POST `/telegram-miniapp` route |
| `apps/api/src/controllers/users.controller.ts` | Add `telegramMiniAppAuth` static method |
| `apps/api/src/services/users.service.ts` | Add `findOrCreateByTelegramMiniApp` + initData validation |
| `apps/api/src/config/env.ts` | Add BOT_TOKEN handling (optional, warn-only) |
| `.env.example` | Document `TELEGRAM_BOT_TOKEN` if not already there |

**Do NOT modify**: Other routes, other controllers, Prisma schema (no migration needed for this story — telegramId already exists from Epic 1).

### Existing Patterns to Reuse

- `telegramAuth` controller method (lines 102–121 in `users.controller.ts`) — same pattern, just different initData source
- `UsersRepository.findByTelegramId` — already exists from Epic 1
- `generateToken(user)` from `@test-system/shared/auth` — same token generation
- `validate(schema)` middleware — same middleware, same pattern

### HMAC-SHA256 initData Validation (Node.js crypto)

```ts
import { createHmac } from "crypto";

function validateInitData(initData: string, botToken: string): {
  valid: boolean;
  expired: boolean;
  telegramId?: string;
  fullName?: string;
} {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { valid: false, expired: false };

  params.delete("hash");

  // Sort params and build data_check_string
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  // Derive secret key
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  // Compute hash
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return { valid: false, expired: false };

  // Check expiry (24 hours)
  const authDate = parseInt(params.get("auth_date") ?? "0", 10);
  const expired = Math.floor(Date.now() / 1000) - authDate > 86400;
  if (expired) return { valid: true, expired: true };

  // Parse user field
  const userJson = params.get("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const telegramId = String(user?.id ?? "");
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  return { valid: true, expired: false, telegramId, fullName };
}
```

### Error Response Format

Always `{ error: string, code?: string }` per CLAUDE.md convention:
- Invalid signature: `{ error: "Invalid auth data", code: "INIT_DATA_INVALID" }` — 401
- Expired: `{ error: "Auth data expired", code: "INIT_DATA_EXPIRED" }` — 401

### User Model — phone Nullability

From Epic 1 (Story 1.1), `User.phone` is stored as unique. The Mini App initData does NOT provide a phone number. Check the Prisma schema — `phone` should be `String?` (nullable) after Epic 1 migration. If `createTelegramUser` requires phone, add an overload or pass `null`.

### References

- [Source: apps/api/src/config/schemas.ts] — Schema pattern (telegramAuthSchema line 55)
- [Source: apps/api/src/routes/auth.ts] — Route registration pattern
- [Source: apps/api/src/controllers/users.controller.ts] — telegramAuth method (lines 102–121)
- [Source: apps/api/src/services/users.service.ts] — findOrCreateByTelegram (lines 40–48)
- [Source: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app] — Official Telegram initData validation spec

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
