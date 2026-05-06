# ⚪ DEFERRED

### W1 — `isAlwaysAvailable: false` + null dates allows unrestricted access
**File:** `apps/api/src/services/attempts.service.ts` — `validateTestAvailability`  
Pre-existing behavior: when `isAlwaysAvailable = false` and both dates are null, no restriction fires. Not introduced by this sprint.

---

### W2 — Race condition on `allowOnlyOneAttempt` (double-tap)
Two simultaneous `POST /api/tests/:testId/attempts/start` requests from the same student can both pass the completed-attempt check before either creates an attempt. Needs DB-level unique constraint or transaction — design decision required.

---

### W3 — `testPassword` brute-force enumeration
1000 possible codes. Global rate-limit (100 req/min) allows full enumeration in ~10 minutes. Needs per-endpoint or per-user rate limiting infrastructure — out of scope for this sprint.

---
