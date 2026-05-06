# 🔴 DECISION NEEDED (resolve before patching)

### D1 — Tests page: limit=1000 but API hard-caps at 100
**File:** `apps/admin-dashboard/app/dashboard/tests/page.tsx`  
The page fetches `?limit=1000` but `getAllTests` enforces `Math.min(100, requested)` — tests 101+ are silently invisible to admins with no warning. The old URL-based server pagination was removed.

**Options:**
- (a) Raise API `getAllTests` cap (e.g., to 1000) and keep `DataTable` client-side pagination as-is
- (b) Restore server-side pagination with `searchParams` in the page

---

### D2 — `GET /api/tests/:testId` — student token access unknown
**File:** `apps/telegram-bot/src/bot.ts` — `showAlreadyAttemptedMessage`  
This helper calls `GET /api/tests/:testId` to compute `maxScore` for the "already attempted" message. If that route is admin-only (`verifyAdminMiddleware`), `questionCount` is always 0 and the score display is broken for students.

**Options:**
- (a) Confirm the route is accessible to all authenticated roles (no change needed)
- (b) Include `questionCount` / `maxPossibleScore` in the `/attempts/my-attempts` response instead
- (c) Add a student-accessible test summary endpoint

---
