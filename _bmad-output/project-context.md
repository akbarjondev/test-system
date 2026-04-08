---
project_name: 'test-system'
user_name: 'Akbar'
date: '2026-04-08'
sections_completed: ['technology_stack', 'critical_rules', 'api_patterns', 'dashboard_patterns', 'database_patterns', 'auth_patterns', 'telegram_bot_patterns']
existing_patterns_found: 42
---

# Project Context for AI Agents

_Critical rules and patterns AI agents MUST follow when implementing code in this project. These are the non-obvious details that would otherwise be missed._

---

## Technology Stack & Versions

### Monorepo
- **Turborepo** (latest) — task runner; `turbo run build/dev/lint`
- **npm workspaces** — package manager: `npm@10.9.2`

### Apps
| App | Framework | Version |
|-----|-----------|---------|
| `apps/api` | Express | `^5.2.1` |
| `apps/admin-dashboard` | Next.js | `16.1.1` |
| `apps/telegram-bot` | grammY | `^1.36.3` |

### Packages
| Package | Purpose |
|---------|---------|
| `packages/database` | Prisma `^6.x` + PostgreSQL — generated client at `./prisma/generated/client` |
| `packages/shared` | bcryptjs + jsonwebtoken utilities |
| `packages/types` | Shared TypeScript interfaces |

### Key Libraries
- **Validation**: Zod `^4.3.6` (dashboard), Zod (API — same ecosystem)
- **ORM**: Prisma only — **no raw SQL ever**
- **Auth**: JWT (`jsonwebtoken`), bcryptjs — 7-day expiry, `JWT_SECRET` env var
- **UI**: Tailwind CSS `^4`, Radix UI, shadcn components, `react-hook-form ^7`, `sonner ^2` toasts
- **Date**: `dayjs` for display, `date-fns` available
- **API Security**: `helmet`, `cors`, `express-rate-limit` (100 req/min per IP)

### TypeScript
- **Strict mode** everywhere (`"strict": true`)
- API uses `baseUrl: "."` with path alias `src/` — imports use `src/services/...` not `./src/services/...`
- Dashboard uses `@/` alias for all local imports
- Packages imported as `@test-system/database/*`, `@test-system/shared/*`, `@test-system/types`

---

## Critical Implementation Rules

### ABSOLUTE PROHIBITIONS
1. **No raw SQL** — Prisma only, always
2. **No `console.log`** in committed code
3. **No inline Zod schemas** in route files — all schemas go in `apps/api/src/config/schemas.ts`
4. **No hardcoded env vars** — always read from `process.env`
5. **No student-facing web pages** — students use Telegram bot + Flutter only
6. **Never break Prisma cascade deletes**: `Test → Question → Option / QuestionOrder / Answer`

### Error Response Format (MUST match exactly)
```json
// Generic error:
{ "error": "string", "code"?: "string" }

// Validation error (from validate middleware):
{ "error": "Validation failed", "details": [{ "field": "string", "message": "string" }] }
```

### HTTP Status Codes (enforced pattern)
- `200` — GET success, POST answer submit
- `201` — POST create (test, question, attempt start)
- `204` — DELETE success (no body)
- `400` — validation / business logic error
- `401` — missing token
- `403` — invalid token, wrong role, unauthorized action
- `404` — resource not found
- `500` — unexpected server error

### Pagination Pattern (ALL list endpoints)
Returns `PaginatedResponse<T>` from `@test-system/types`:
```typescript
{
  data: T[],
  pagination: {
    page: number, limit: number, total: number,
    totalPages: number, hasNext: boolean, hasPrev: boolean
  }
}
```
Default: `page=1, limit=20`. Max limit: `100`. Parse with: `Math.max(1, parseInt(...) || 1)`.

---

## API Patterns (`apps/api`)

### Import Convention
```typescript
// CORRECT — uses baseUrl "." so src/ is the root:
import { TestsService } from "src/services/tests.service";
import { UserRole } from "src/types/enums";
// NOT relative paths like ../../services/...
```

### Middleware Chain (order matters)
```
helmet → cors → express.json → rateLimit → router
  → validate(zodSchema)       [body routes only, before auth]
  → verifyTokenMiddleware     [JWT check, attaches req.user]
  → verifyAdminMiddleware     [admin-only routes only]
  → Controller
```

### Controller Pattern
```typescript
export class FooController {
  static async doThing(req: Request<{fooId: string}, any, BodyType>, res: Response) {
    try {
      const result = await FooService.doThing(...);
      return res.status(201).json(result);
    } catch (error: any) {
      // Map known error messages to HTTP codes:
      if (error.message === "Not found") return res.status(404).json({ error: error.message });
      if (error.message.includes("Unauthorized")) return res.status(403).json({ error: error.message });
      return res.status(500).json({ error: "Failed to ..." });
    }
  }
}
```

### Service Pattern
- Business logic + authorization checks live in Services
- Services throw `new Error("message")` with specific strings (controllers map these to HTTP codes)
- Authorization pattern: check ownership OR admin role
  ```typescript
  if (resource.createdById !== userId && userRole !== UserRole.ADMIN) {
    throw new Error("Unauthorized: You can only ...");
  }
  ```

### Repository Pattern
- Only Prisma queries here — no business logic
- Always import `prisma` from `@test-system/database/lib/prisma`
- Always import Prisma types from `@test-system/database/prisma/generated/client`
- Use `includeRelations: boolean` flag pattern for optional eager loading

### Route Registration Pattern
```typescript
// Route file: apps/api/src/routes/foo.ts
const router = express.Router();
router.use(verifyTokenMiddleware); // apply to all
router.post("/", validate(createFooSchema), FooController.createFoo);
router.get("/:fooId", FooController.getFoo);
// Register in server.ts:
app.use("/api/foos", fooRoutes);
```

### Adding a New Zod Schema
Always add to `apps/api/src/config/schemas.ts`:
```typescript
export const createFooSchema = z.object({ ... });
export const updateFooSchema = createFooSchema.partial();
```

### req.user Type
`req.user` is typed as `Omit<User, "password">` via `apps/api/src/types/express.d.ts`. Contains: `id`, `email`, `role`, `createdAt`.

### UserRole Enum
Defined locally in `apps/api/src/types/enums.ts`:
```typescript
// Use: UserRole.ADMIN, UserRole.STUDENT
```
Not imported from `@test-system/types` in the API — use the local enum.

---

## Admin Dashboard Patterns (`apps/admin-dashboard`)

### Import Aliases
- `@/` maps to the dashboard root (not `src/` — there is no `src/` folder)
- `@test-system/database/*` for Prisma types
- `@test-system/types` for shared interfaces

### Directory Structure
```
app/                    — Next.js App Router pages
  auth/login/           — Login page
  dashboard/            — Protected dashboard layout
    tests/              — Test management
      [id]/             — Test detail, edit, results
        questions/      — Question management
    students/           — Student management
    attempts/           — All attempts view
actions/<domain>.ts     — Server actions ("use server")
components/ui/          — shadcn UI components
config/
  enums.ts              — ROUTES, API_ROUTES, UserRole enums
  constants.ts          — API_URL, COOKIE_MAX_AGE
definitions/<domain>.ts — Client-side Zod schemas for forms
lib/
  utils.ts              — cn(), formatDuration()
  server-utils.ts       — getToken() (reads httpOnly cookie)
```

### Server Actions Pattern (`actions/<domain>.ts`)
```typescript
"use server";
// 1. Get token from cookie:
const token = await getToken();
// 2. Call API with Bearer token:
const response = await fetch(`${API_URL}${API_ROUTES.TESTS}`, {
  method: "POST",
  body: JSON.stringify(data),
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
});
// 3. Check for error in response body:
const responseData = await response.json();
if (responseData.error) return { error: responseData.error };
// 4. Redirect on success:
redirect(ROUTES.TESTS);
```
- Always use `revalidatePath()` after mutations that don't redirect
- Return `{ error?: string }` on failure; redirect on success
- `redirect()` throws internally — do NOT wrap it in try/catch (it works via Next.js exception)
  - Exception: `redirect()` after fetch — place OUTSIDE try/catch block

### Form Pattern (Client Components)
```typescript
"use client";
// Uses react-hook-form + zod + zodResolver
// Schema defined in definitions/<domain>.ts (NOT inline)
// Toasts via sonner: toast.error() / toast.success()
// useRouter().push() for programmatic navigation
```

### Page Components (Server Components)
- Fetch data directly with Bearer token from cookie: `getToken()`
- Cast API responses: `const data = (await res.json()) as unknown as SomeType`
- Use `TestWithRelations` type from `@test-system/types` for test detail pages

### Auth via Cookie (proxy.ts middleware)
- Token stored in `token` httpOnly cookie
- User info stored in `user` cookie (JSON string)
- Middleware (`proxy.ts`) checks auth and redirects appropriately
- Students hitting admin routes get redirected to `/dashboard/student`

### Route Definitions
Always use `ROUTES` enum from `@/config/enums`, never hardcode strings:
```typescript
ROUTES.DASHBOARD = "/dashboard"
ROUTES.TESTS = "/dashboard/tests"
ROUTES.STUDENTS = "/dashboard/students"
ROUTES.LOGIN = "/auth/login"
```

### UI Components Pattern
```typescript
// shadcn-style: imported from @/components/ui/<component>
// Custom form fields from @/components/ui/field:
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
```

---

## Database Patterns (`packages/database`)

### Prisma Client Location
```typescript
import { prisma } from "@test-system/database/lib/prisma";
import { User, Test, Question, Option } from "@test-system/database/prisma/generated/client";
```

### Schema Key Points
- All IDs: `@id @default(cuid())` — string CUIDs, not integers
- All timestamps: `DateTime @default(now())`
- User password NEVER returned — always `select` or `Omit<User, "password">`
- Cascade deletes: `Test → Question (onDelete: Cascade)`, `Question → Option (onDelete: Cascade)`, `TestAttempt → QuestionOrder / Answer (onDelete: Cascade)`
- `Option.order` is unique per question: `@@unique([questionId, order])`
- `Answer` is unique per question per attempt: `@@unique([attemptId, questionId])`
- `QuestionOrder` tracks shuffled question display order per attempt

### Test Availability Logic
```typescript
// In repositories — available tests filter:
{
  OR: [
    { isAlwaysAvailable: true },
    { isAlwaysAvailable: false, availableFrom: { lte: now }, availableUntil: { gte: now } }
  ]
}
```

### After Schema Changes
```bash
cd packages/database && npm run db:migrate   # create + apply migration
cd packages/database && npm run db:generate  # regenerate Prisma client
```

---

## Authentication Patterns (`packages/shared`)

### JWT Token
- Sign: `generateToken(user: Omit<User, "password">)` → embeds full user object, 7d expiry
- Verify: `verifyToken(token)` → returns `Omit<User, "password">`
- Secret: `process.env.JWT_SECRET` — MUST be set; validated at startup
- Production guard: `JWT_SECRET === "secret"` → process exits

### Roles
- `Role.ADMIN` — can manage all tests, view all attempts
- `Role.STUDENT` — can take tests, view own attempts only
- Admins can update/delete ANY test; students only their own (but students can't create tests — that's admin-only in practice via dashboard)

---

## Telegram Bot Patterns (`apps/telegram-bot`)

### Session-Based State Machine
```typescript
// State: "idle" | "reg_email" | "reg_password" | "login_email" | "login_password"
// Token stored in session: ctx.session.token
// Active attempt stored: ctx.session.currentAttempt
```

### API Communication
```typescript
// All API calls go through the local api() helper:
async function api(method, path, body?, token?)
// Always sends Authorization: Bearer <token>
// API_URL from process.env.API_URL (default: http://localhost:5000)
```

### Answer Submission Flow
1. Bot stores `questionId` + `options[]` in session
2. User selects option by index (0-based in callback data `ans:0`, `ans:1`, etc.)
3. Bot submits `{ questionId, optionId: option.id }` to `POST /api/attempts/:id/answers`
4. After all questions → auto-submits via `POST /api/attempts/:id/submit`
5. Score displayed as `score / maxPossibleScore (percent%)`

### isCorrect NEVER sent to bot
The API strips `isCorrect` from options in `startTest` and `getCurrentAttempt` responses. Never expose it.

---

## Environment Variables

### API (`apps/api/.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=<strong secret>
PORT=5000  (optional, defaults to 5000)
```

### Dashboard (`apps/admin-dashboard/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Telegram Bot (`apps/telegram-bot/.env`)
```
TELEGRAM_BOT_TOKEN=<bot token>
API_URL=http://localhost:5000
```

---

## File Naming Conventions

- **Files**: camelCase (e.g., `tests.service.ts`, `server-utils.ts`)
- **React components**: PascalCase files (e.g., `FormQuestion.tsx`, `DeleteTestButton.tsx`)
- **Classes**: PascalCase (e.g., `TestsController`, `TestsService`, `TestsRepository`)
- **Enums**: UPPER_CASE values (e.g., `UserRole.ADMIN`)
- **Routes**: co-located `ui/` subfolder for client components within page directories

---

## Common Gotchas

1. **`redirect()` in server actions** — must be OUTSIDE try/catch or it won't work (it throws internally)
2. **API import paths** — use `src/...` not `./src/...` or relative paths (tsconfig `baseUrl: "."`)
3. **Prisma client** is at `packages/database/prisma/generated/client` — never import from `@prisma/client`
4. **`params` in Next.js 16** — `params` is a `Promise<{id: string}>`, must `await params`
5. **`isCorrect` in API responses** — strip from options during active attempts; only show after submission
6. **Option order** — always set `order` field on options (0-indexed); `@@unique([questionId, order])` constraint enforced
7. **Date handling** — API receives ISO strings (`z.string().datetime({ offset: true })`), converts to `new Date()` before saving; dashboard sends `.toISOString()` 
8. **`verifyAdminMiddleware`** is separate from `verifyTokenMiddleware` — apply both for admin-only routes
9. **`console.log` exists in some controllers** — do NOT add more; existing ones are tech debt, not a pattern to follow
10. **UI language** — Dashboard UI text is in Uzbek; keep new UI text consistent in Uzbek
