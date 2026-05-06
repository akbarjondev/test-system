# Technology Stack & Versions

### Monorepo
- **Turborepo** (latest) — task runner; `turbo run build/dev/lint`
- **npm workspaces** — package manager: `npm@10.9.2`

### Apps
| App | Framework | Version |
|-----|-----------|---------|
| `apps/api` | Express | `^5.2.1` |
| `apps/admin-dashboard` | Next.js | `16.2.4` |
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
