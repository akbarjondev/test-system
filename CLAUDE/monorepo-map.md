# Monorepo Map

| App / Package               | Purpose                                              | Port |
|-----------------------------|------------------------------------------------------|------|
| `apps/admin-dashboard`      | Next.js 16 admin UI — create/manage tests, results   | 3000 |
| `apps/api`                  | Express 5 REST API — all business logic              | 5000 |
| `apps/telegram-bot`         | grammy Telegram bot — student test-taking interface  | —    |
| `apps/mini-app`             | Vite/React Telegram Mini App — student test-taking   | 5173 |
| `packages/database`         | Prisma schema + generated client + migrations        | —    |
| `packages/shared`           | JWT sign/verify utilities                            | —    |
| `packages/types`            | Shared TypeScript types                              | —    |
| `packages/ui`               | Shared UI components (shadcn/Radix)                  | —    |
| `packages/typescript-config`| Shared tsconfig                                      | —    |

---
