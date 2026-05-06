# Authentication Patterns (`packages/shared`)

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
