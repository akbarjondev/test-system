# Auth Flows

### Admin Dashboard (httpOnly Cookie)

```
1. Admin submits login form
2. Server action calls POST /api/auth/login
3. API returns { token }
4. proxy.ts (Next.js route handler) sets httpOnly cookie "token=<jwt>"
5. Subsequent server actions call getToken() → reads cookie from server context
6. Each API call: Authorization: Bearer <token>
7. Logout: server action clears cookie
```

### Telegram Bot / Flutter App (Bearer Token)

```
1. User sends /login command or taps login in app
2. Client collects email + password
3. Client calls POST /api/auth/login
4. API returns { token }
5. Bot: token stored in grammY session (in-memory, cleared on restart)
   App: token stored in Flutter secure storage (persists across app restarts)
6. Every API call includes: Authorization: Bearer <token>
7. verifyTokenMiddleware:
   a. Extracts token from header
   b. Calls verifyToken(token) [packages/shared/auth]
   c. Looks up user in DB to confirm existence
   d. Attaches decoded payload to req.user
```

---
