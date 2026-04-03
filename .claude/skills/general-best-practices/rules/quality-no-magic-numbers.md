---
title: Named Constants Over Magic Numbers and Strings
impact: MEDIUM
impactDescription: intent is clear; change in one place propagates everywhere
tags: code-quality, constants, magic-numbers, readability, maintainability
---

## Named Constants Over Magic Numbers and Strings

A bare number or string literal in logic is a "magic" value — its meaning is invisible without context. Named constants make intent explicit and ensure changes happen in one place.

**Incorrect (what do these numbers mean?):**

```typescript
if (req.body.password.length < 6) {
  return res.status(400).json({ error: "Password too short" });
}

rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

const score = correct * 1.5;  // why 1.5?

if (attempt.timeTaken > 30 * 60) {  // 30 minutes? why inline?
  // ...
}
```

**Correct (intent is named):**

```typescript
const MIN_PASSWORD_LENGTH = 6;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;
const DEFAULT_POINTS_PER_QUESTION = 1.5;
const MAX_ATTEMPT_DURATION_SECONDS = 30 * 60; // 30 minutes

if (req.body.password.length < MIN_PASSWORD_LENGTH) {
  return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
}

rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX_REQUESTS,
});
```

**Where to put them:**
- Module-level `const` in the same file if used only there
- `apps/api/src/config/constants.ts` if shared across the API
- `apps/admin-dashboard/config/constants.ts` for dashboard-wide constants

**What counts as magic:**
- Any number other than `0`, `1`, `-1` used in logic
- Any string used as a status/type discriminator (use an enum or `as const` object instead)
- HTTP status codes are fine as literals (`res.status(404)`) — they're universally known

**Enums for string discriminators:**

```typescript
// Incorrect
if (user.role === "ADMIN") { }

// Correct — already done in this project via the Role enum
import { Role } from "@test-system/database/generated/client";
if (user.role === Role.ADMIN) { }
```
