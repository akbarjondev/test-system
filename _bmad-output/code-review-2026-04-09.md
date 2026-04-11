# Code Review — Full Sprint (Epics 2–5)
**Date:** 2026-04-09  
**Scope:** All 16 stories (Epics 2–5), full uncommitted diff  
**Reviewers:** Blind Hunter + Edge Case Hunter + Acceptance Auditor  
**Result:** 2 decision-needed · 17 patch · 3 deferred · 5 dismissed

---

## STATUS

- [x] D1 resolved — API cap raised to 1000
- [x] D2 resolved — GET /api/tests/:testId confirmed accessible to all authenticated roles (no verifyAdminMiddleware)
- [x] All patches applied (P1–P16) — 2026-04-09

---

## 🔴 DECISION NEEDED (resolve before patching)

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

## 🟠 HIGH PATCHES

### P1 — `passed` field never returned from submit API ⚠️ CRITICAL
**Sources:** Blind Hunter + Edge Case Hunter + Acceptance Auditor  
**Files:**
- `apps/api/src/controllers/attempts.controller.ts` — `submitTest` method
- `apps/telegram-bot/src/bot.ts` — `submitTest` function

**Problem:** `AttemptsController.submitTest` response only returns `{ id, testId, studentId, startedAt, submittedAt, score, maxPossibleScore, message }`. The `passed` field is never computed or included. The bot reads `result.passed` — it's always `undefined` — so the pass/fail message ("O'tdingiz!" / "O'tmadingiz.") is **dead code** and never shown for any submission.

**Fix:** In `AttemptsController.submitTest`, after computing the result, add:
```ts
const passed = test.passingScore != null ? result.score >= test.passingScore : null;
```
Include `passed` in the JSON response.

---

### P2 — `console.log` survives in `attempts.controller.ts` (NFR5 violation)
**Sources:** Acceptance Auditor  
**File:** `apps/api/src/controllers/attempts.controller.ts`  
Multiple `console.log(error)` calls remain at approximately lines 150, 196, 251, 323, 353, 379.

**Fix:** Remove all `console.log` calls from `attempts.controller.ts`.

---

## 🟡 MEDIUM PATCHES

### P3 — Duplicate `verifyTokenMiddleware` on `/unlock` route
**Sources:** Blind Hunter + Edge Case Hunter + Acceptance Auditor  
**File:** `apps/api/src/routes/tests.ts`  
`router.use(verifyTokenMiddleware)` already applies to all routes. The `/unlock` route adds it again as a per-route parameter, running JWT verification twice.

**Fix:** Remove the second `verifyTokenMiddleware` from:
```ts
router.post("/unlock", validate(testUnlockSchema), verifyTokenMiddleware, TestsController.unlockTest);
// → 
router.post("/unlock", validate(testUnlockSchema), TestsController.unlockTest);
```

---

### P4 — `allowOnlyOneAttempt` checkbox uses `form.getValues()` (not reactive)
**Sources:** Blind Hunter  
**Files:**
- `apps/admin-dashboard/app/dashboard/tests/[id]/edit/ui/FormEditTest.tsx`
- `apps/admin-dashboard/app/dashboard/tests/new/ui/FormTest.tsx`

**Problem:** `checked={form.getValues("allowOnlyOneAttempt")}` is not reactive — `getValues()` reads at call time but doesn't subscribe to re-renders. The `isAlwaysAvailable` checkbox on the same form correctly uses `form.watch()`. The checkbox can visually desync from actual form state.

**Fix:**
```tsx
// Change:
checked={form.getValues("allowOnlyOneAttempt")}
// To:
checked={form.watch("allowOnlyOneAttempt")}
```
Apply in both form files.

---

### P5 — `findCompletedAttemptByTestAndStudent` ignores timed-out attempts
**Sources:** Edge Case Hunter  
**File:** `apps/api/src/repositories/attempts.repository.ts`  
**Problem:** The `allowOnlyOneAttempt` enforcement queries `submittedAt: { not: null }`. A timed-out attempt has `submittedAt = null` with `timedOutAt` set — so students can start a fresh attempt after timing out, defeating the one-attempt rule.

**Fix:** Update the query to include timed-out attempts:
```ts
where: {
  testId,
  studentId,
  OR: [
    { submittedAt: { not: null } },
    { timedOutAt: { not: null } },
  ],
}
```

---

### P6 — `submitTest` (bot) clears `currentAttempt` before checking error response
**Sources:** Blind Hunter  
**File:** `apps/telegram-bot/src/bot.ts` — `submitTest` function  
**Problem:** `ctx.session.currentAttempt = undefined` is set before the error response is checked. On a 500 or network error, the student's attempt reference is permanently lost from session — the attempt stays orphaned in the DB as in-progress.

**Fix:** Move `ctx.session.currentAttempt = undefined` to after the success check, not at the top of the handler.

---

### P7 — `start_unlocked_test` missing auth guard
**Sources:** Blind Hunter + Edge Case Hunter  
**File:** `apps/telegram-bot/src/bot.ts` — `start_unlocked_test` callback  
**Problem:** Unlike `start_test_flow` which checks `if (!ctx.session.token)`, the `start_unlocked_test` callback skips this guard. If the token is missing, the API returns 401 and the student sees a confusing generic error instead of a login prompt.

**Fix:** Add at the top of the `start_unlocked_test` handler:
```ts
if (!ctx.session.token) {
  await ctx.reply("Iltimos, avval tizimga kiring.");
  await showMainMenu(ctx);
  return;
}
```

---

### P8 — "Vaqt tugadi" badge appears in Natija column (should be Holat only)
**Sources:** Acceptance Auditor  
**File:** `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx` — `NatijaCell`  
**Problem:** `NatijaCell` shows "Vaqt tugadi" (orange) when `timedOutAt` is set. Per spec, Natija shows pass/fail only; Holat column shows attempt state. This duplicates Holat and contradicts the spec.

**Fix:** Remove the `timedOutAt` branch from `NatijaCell`. Return `null` for timed-out attempts in the Natija column (the Holat column already handles it).

---

### P9 — Onboarding prompt text: "Ismingizni" vs spec "Ismingiz"
**Sources:** Acceptance Auditor  
**File:** `apps/telegram-bot/src/bot.ts`  
**Problem:** Bot sends `"Ismingizni va familiyangizni kiriting:"` (genitive inflection). Spec requires `"Ismingiz va familiyangizni kiriting:"` (nominative).

**Fix:** Change the string in `bot.ts` from `"Ismingizni va familiyangizni kiriting:"` to `"Ismingiz va familiyangizni kiriting:"`.

---

### P10 — `ctx.deleteMessage()` deletes student's contact message, not bot's prompt
**Sources:** Acceptance Auditor  
**File:** `apps/telegram-bot/src/bot.ts` — `bot.on("message:contact")` handler  
**Problem:** The code calls both `ctx.api.deleteMessage(chatId, lastBotMessageId)` (correct — deletes bot's "share phone" prompt) AND `ctx.deleteMessage()` (incorrect — deletes the student's contact share message, not a bot message). Spec says delete the bot's previous onboarding message.

**Fix:** Remove the `ctx.deleteMessage()` call. Keep only `ctx.api.deleteMessage(ctx.chat!.id, ctx.session.lastBotMessageId!)`.

---

### P11 — `testPassword` not validated as digits-only at API or bot level
**Sources:** Edge Case Hunter + Acceptance Auditor  
**Files:**
- `apps/api/src/config/schemas.ts` — `createTestSchema` and `testUnlockSchema`
- `apps/telegram-bot/src/bot.ts` — `awaiting_test_code` text handler

**Problem:** Dashboard form enforces `/^\d{3}$/` but API schema only enforces `.length(3)`. Bot only checks `length !== 3`. Non-digit 3-char codes like `"abc"` silently pass API validation.

**Fix:**
1. In `schemas.ts`, update both schemas:
   ```ts
   testPassword: z.string().length(3).regex(/^\d{3}$/).optional().nullable()
   // and in testUnlockSchema:
   testPassword: z.string().length(3).regex(/^\d{3}$/)
   ```
2. In `bot.ts` `awaiting_test_code` handler:
   ```ts
   if (!/^\d{3}$/.test(text.trim())) {
     await ctx.reply("Faqat 3 ta raqam kiriting.");
     return;
   }
   ```

---

### P12 — Unescaped Markdown in stored `currentQuestionText`
**Sources:** Edge Case Hunter  
**File:** `apps/telegram-bot/src/bot.ts` — `sendQuestion` + `ans:` handler  
**Problem:** Question text with Markdown special chars (`_`, `*`, `` ` ``, `[`) is stored raw in `session.currentQuestionText`. When `editMessageText` is called with `parse_mode: "Markdown"`, Telegram may fail to parse — silently caught — and the student sees no answer confirmation.

**Fix:** Apply the existing `escapeMarkdown` helper to `question.text` before storing it in `currentQuestionText`.

---

## 🟢 LOW PATCHES

### P13 — `console.error` in `bot.catch` (NFR5 spirit)
**File:** `apps/telegram-bot/src/bot.ts` line ~91  
**Fix:** Replace `console.error("Bot error:", err.error)` with a proper logger or remove.

---

### P14 — "Talaba" badge uses `outline` variant instead of gray
**File:** `apps/admin-dashboard/app/dashboard/users/ui/UsersTable.tsx`  
**Fix:**
```tsx
// Change:
<Badge variant="outline">Talaba</Badge>
// To:
<Badge className="bg-gray-100 text-gray-800">Talaba</Badge>
```

---

### P15 — `showAlreadyAttemptedMessage` missing null check on second API call
**File:** `apps/telegram-bot/src/bot.ts` — `showAlreadyAttemptedMessage`  
**Problem:** If `GET /api/tests/:testId` fails, `test` is undefined. `test.questions?.length ?? 0` causes `maxScore = 0`, showing `"50 / 0 (0%)"`.

**Fix:** Add `if (!test || test.error) { /* fall back to score only */ }` after the second API call.

---

### P16 — `NatijaCell` blank for submitted attempts with no `passingScore`
**File:** `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx`  
**Problem:** When `passingScore` is null and attempt is submitted, `NatijaCell` returns `null` — the column is blank, which looks like a broken table.

**Fix:** Add a final fallback in `NatijaCell`:
```tsx
if (attempt.status === "submitted") {
  return <Badge variant="outline">Topshirildi</Badge>;
}
return null;
```

---

### P17 — Bot digit validation (covered by P11)
Included in P11 above.

---

## ⚪ DEFERRED

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

## DISMISSED (5)

1. Results page resource leak (unread response body) — Node.js handles gracefully
2. Story 4.3 helper text rendering — renders correctly in browser
3. Story 3.1 answer confirmation format — minor cosmetic, not a spec violation
4. Story 2.3 two-reply pattern for wrong code — functional, minor deviation
5. Story 4.2 `passed` in attempts list endpoint — no actual gap confirmed (computed fields serialized correctly)

---

## HOW TO APPLY

In a new context, tell Claude:
> "Read `_bmad-output/code-review-2026-04-09.md` and apply all the patch fixes listed (P1–P16). Start with P1 (the critical `passed` field fix), then batch the rest."

Resolve D1 and D2 first (your decisions on pagination approach and student test access).
