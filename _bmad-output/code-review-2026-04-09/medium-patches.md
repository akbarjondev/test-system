# 🟡 MEDIUM PATCHES

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
