# Architecture

**API request path:**
```
Client
  → helmet (security headers)
  → cors
  → express.json (body parsing)
  → rate-limit (100 req/min per IP)
  → router
      → validate(zodSchema)          [Zod middleware — body routes only]
      → verifyTokenMiddleware        [JWT check, attaches req.user]
      → verifyAdminMiddleware        [role check — admin-only routes]
      → Controller
          → Service
              → Repository
                  → Prisma → PostgreSQL
```

**Auth per client type:**

| Client            | Token storage          | How sent to API                     |
|-------------------|------------------------|-------------------------------------|
| Admin dashboard   | httpOnly cookie (proxy)| `proxy.ts` forwards as Bearer token |
| Telegram bot      | grammY session         | `Authorization: Bearer <token>`     |
| Flutter app       | Secure storage         | `Authorization: Bearer <token>`     |

**JWT flow:**
1. `POST /api/auth/login` → API returns `{ token, user }`
2. Dashboard stores token via `apps/admin-dashboard/proxy.ts` in httpOnly cookie
3. Every protected request: `Authorization: Bearer <token>` → `verifyTokenMiddleware` verifies + attaches `req.user`

---
