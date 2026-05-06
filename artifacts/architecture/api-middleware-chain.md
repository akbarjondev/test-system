# API Middleware Chain

Applied globally in `apps/api/src/server.ts`:

```
1. helmet()          — Sets security headers (CSP, HSTS, etc.)
2. cors()            — Allows cross-origin requests (configure origins in production)
3. express.json()    — Parses JSON request bodies
4. rateLimit()       — 100 requests per IP per minute; returns 429 on breach
```

Applied per-route:

```
5. validate(schema)         — Zod validation of req.body; 400 on failure
6. verifyTokenMiddleware    — JWT check; 401 if missing, 403 if invalid/expired
7. verifyAdminMiddleware    — Role check; 403 if not ADMIN (admin routes only)
```

Then: `Controller → Service → Repository → Prisma`

---
