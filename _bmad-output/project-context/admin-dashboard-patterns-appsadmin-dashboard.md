# Admin Dashboard Patterns (`apps/admin-dashboard`)

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
