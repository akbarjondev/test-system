# Conventions

- **TypeScript strict** everywhere
- **Zod schemas** always in `apps/api/src/config/schemas.ts` — never inline in route files
- **Prisma only** — no raw SQL, ever
- **Server actions** in `apps/admin-dashboard/actions/<domain>.ts` — marked `"use server"`, call API via `fetch` using `getToken()` from `lib/server-utils`
- **No `console.log`** in committed code
- **Error responses**: `{ error: string, code?: string }`
- **Validation errors**: `{ error: "Validation failed", details: [{ field, message }] }`
- **File naming**: camelCase for files (e.g. `tests.controller.ts`), PascalCase for React components / classes
- **Prisma client import**: `import { ... } from "@test-system/database/prisma/generated/client"`
- **Shared types import**: `import { ... } from "@test-system/types"`
- **No test scripts** exist in this repository

---
