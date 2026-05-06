# Common Gotchas

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

---
