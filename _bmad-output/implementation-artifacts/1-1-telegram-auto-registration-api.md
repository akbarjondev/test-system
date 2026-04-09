# Story 1.1: Telegram Auto-Registration API

Status: done

## Story

As a student,
I want to be automatically registered when I first use the bot,
so that I don't need to create an account manually.

## Acceptance Criteria

1. **Given** a new student sends `/start` for the first time,
   **When** the bot calls `POST /api/auth/telegram` with `{ telegramId, fullName, phone }`,
   **Then** the API creates a new User record with role STUDENT, email null, password null, and returns `{ token, user }`.
   **And** `telegramId` and `phone` are stored as unique fields on the User model.

2. **Given** an existing student sends `/start` again,
   **When** the bot calls `POST /api/auth/telegram` with the same `telegramId`,
   **Then** the API finds the existing user and returns a fresh `{ token, user }` without creating a duplicate.

3. **Given** the schema migration runs,
   **When** applied to the existing database,
   **Then** `User.email` becomes nullable (`String?`), `User.password` becomes nullable (`String?`),
   **And** `User.telegramId String? @unique`, `User.fullName String?`, `User.phone String? @unique` fields are added.
   **And** the existing admin user record (`admin@example.com`) is unaffected — email/password remain intact.

## Tasks / Subtasks

- [ ] Task 1: Update Prisma schema (AC: #3)
  - [ ] Make `User.email String?` (nullable, keep @unique)
  - [ ] Make `User.password String?` (nullable)
  - [ ] Add `User.telegramId String? @unique`
  - [ ] Add `User.fullName String?`
  - [ ] Add `User.phone String? @unique`
  - [ ] Run `cd packages/database && npm run db:migrate` — name migration `add_telegram_identity_to_users`
  - [ ] Run `cd packages/database && npm run db:generate` to regenerate Prisma client

- [ ] Task 2: Update `packages/types/index.ts` (AC: #1, #2)
  - [ ] Update `AuthUser` interface: make `email` nullable (`email: string | null`), add `fullName: string | null`, `phone: string | null`, `telegramId: string | null`

- [ ] Task 3: Add Zod schema to `apps/api/src/config/schemas.ts` (AC: #1)
  - [ ] Add `telegramAuthSchema` validating `{ telegramId: z.string().min(1), fullName: z.string().min(1), phone: z.string().min(1) }`

- [ ] Task 4: Add repository method to `apps/api/src/repositories/users.repository.ts` (AC: #1, #2)
  - [ ] Add `findByTelegramId(telegramId: string): Promise<User | null>` using `prisma.user.findUnique({ where: { telegramId } })`
  - [ ] Add `createTelegramUser({ telegramId, fullName, phone }): Promise<User>` using `prisma.user.create({ data: { telegramId, fullName, phone, role: 'STUDENT' } })`

- [ ] Task 5: Add service method to `apps/api/src/services/users.service.ts` (AC: #1, #2)
  - [ ] Add `findOrCreateByTelegram({ telegramId, fullName, phone }): Promise<User>` — calls `findByTelegramId`, returns existing user or calls `createTelegramUser`

- [ ] Task 6: Add controller method to `apps/api/src/controllers/users.controller.ts` (AC: #1, #2)
  - [ ] Add `static async telegramAuth(req, res)` — calls `UsersService.findOrCreateByTelegram`, calls `generateToken`, returns `{ token, user: { id, fullName, phone, telegramId, role, createdAt } }`

- [ ] Task 7: Register route in `apps/api/src/routes/auth.ts` (AC: #1)
  - [ ] Add `router.post('/telegram', validate(telegramAuthSchema), UsersController.telegramAuth)` — NO `verifyTokenMiddleware` (public endpoint)

## Dev Notes

### Critical Architecture Rules

Follow the existing middleware chain exactly:
```
POST /api/auth/telegram
  → validate(telegramAuthSchema)   ← Zod validation only
  → UsersController.telegramAuth   ← NO verifyToken, NO verifyAdmin
      → UsersService.findOrCreateByTelegram
          → UsersRepository.findByTelegramId | createTelegramUser
              → Prisma → PostgreSQL
```

This endpoint is **public** — no JWT required. Students authenticate for the first time here.

### Schema Migration Warning

`User.email` currently has `@unique` constraint AND is required (`String`). After change to `String?`, the unique constraint remains but allows multiple `null` values in PostgreSQL (nulls are not considered equal in unique constraints — this is correct behavior).

Same applies to `User.phone String? @unique` — multiple null phones are allowed.

Do NOT add a `@default` to `telegramId`, `fullName`, or `phone` — they must remain nullable without defaults.

### generateToken Compatibility

`packages/shared/auth.ts` exports:
```ts
export const generateToken = (user: Omit<User, "password">): string
```

After schema change, `User` will include the new optional fields (`telegramId`, `fullName`, `phone`). The `Omit<User, "password">` type will automatically include these fields. **No change to `generateToken` needed.**

JWT payload will include `telegramId`, `fullName`, `phone` fields (nullable). This is fine — `verifyTokenMiddleware` uses `req.user.id` for DB lookup.

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `packages/database/prisma/schema.prisma` | Schema changes |
| `packages/database/prisma/migrations/` | Auto-generated by `db:migrate` |
| `packages/types/index.ts` | Update `AuthUser` interface |
| `apps/api/src/config/schemas.ts` | Add `telegramAuthSchema` |
| `apps/api/src/repositories/users.repository.ts` | Add 2 methods |
| `apps/api/src/services/users.service.ts` | Add 1 method |
| `apps/api/src/controllers/users.controller.ts` | Add 1 static method |
| `apps/api/src/routes/auth.ts` | Add 1 route |

Do NOT touch: bot files, dashboard files, middleware files, other routes.

### Existing Code Patterns to Follow

**Repository pattern** (copy existing style exactly):
```ts
static async findByTelegramId(telegramId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { telegramId } });
}
```

**Service pattern** (find-or-create):
```ts
static async findOrCreateByTelegram(data: {
  telegramId: string;
  fullName: string;
  phone: string;
}): Promise<User> {
  const existing = await UsersRepository.findByTelegramId(data.telegramId);
  if (existing) return existing;
  return UsersRepository.createTelegramUser(data);
}
```

**Controller response pattern** (match existing login response shape):
```ts
static async telegramAuth(req: Request, res: Response) {
  try {
    const { telegramId, fullName, phone } = req.body;
    const user = await UsersService.findOrCreateByTelegram({ telegramId, fullName, phone });
    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        telegramId: user.telegramId,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

### No console.log

All existing controllers have `console.log(error)` — do NOT replicate this in new code. Convention says no console.log in committed code (NFR5). Use error return only.

### Type Update Required

`packages/types/index.ts` — update `AuthUser`:
```ts
export interface AuthUser {
  id: string;
  email: string | null;        // was: email: string
  fullName: string | null;     // new
  phone: string | null;        // new
  telegramId: string | null;   // new
  role: "ADMIN" | "STUDENT";
  createdAt: Date;
}
```

This may cause TypeScript errors in dashboard/API code that assumes `email` is non-null. Fix by adding null checks where `email` is displayed in dashboard (just guard with `user.email ?? ''`).

### Project Structure Notes

- Prisma client import: `import { prisma } from "@test-system/database/lib/prisma"`
- Prisma types import: `import { User } from "@test-system/database/prisma/generated/client"`
- Shared auth import: `import { generateToken } from "@test-system/shared/auth"`
- Types import: `import { AuthUser, AuthResponse } from "@test-system/types"`

### References

- [Source: packages/database/prisma/schema.prisma] — Current User model
- [Source: apps/api/src/repositories/users.repository.ts] — Repository pattern
- [Source: apps/api/src/services/users.service.ts] — Service pattern
- [Source: apps/api/src/controllers/users.controller.ts] — Controller pattern
- [Source: apps/api/src/routes/auth.ts] — Route registration pattern
- [Source: apps/api/src/config/schemas.ts] — Zod schema location
- [Source: packages/shared/auth.ts] — generateToken signature
- [Source: packages/types/index.ts] — AuthUser and AuthResponse interfaces
- [Source: artifacts/architecture.md] — Middleware chain

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List

- `packages/database/prisma/schema.prisma` — Made `email` and `password` nullable; added `telegramId`, `fullName`, `phone` fields to User model
- `packages/database/prisma/migrations/20260409000000_add_telegram_identity_to_users/migration.sql` — Migration SQL for schema changes
- `packages/types/index.ts` — Updated `AuthUser` interface: `email` nullable, added `fullName`, `phone`, `telegramId` fields
- `apps/api/src/config/schemas.ts` — Added `telegramAuthSchema`
- `apps/api/src/repositories/users.repository.ts` — Added `findByTelegramId` and `createTelegramUser` methods
- `apps/api/src/services/users.service.ts` — Added `findOrCreateByTelegram` method; guarded nullable `email`/`password` in `createUser`
- `apps/api/src/controllers/users.controller.ts` — Added `telegramAuth` static method; updated `login` response to include new fields; guarded nullable `password` in `comparePassword`
- `apps/api/src/routes/auth.ts` — Registered `POST /telegram` route with `telegramAuthSchema` validation
- `apps/admin-dashboard/app/dashboard/students/page.tsx` — Updated `User` type to allow `email: string | null`; added null guard on display
- `apps/admin-dashboard/app/dashboard/students/ui/ChangeRoleButton.tsx` — Updated `User` type to allow `email: string | null`; added null guard in confirm dialog
