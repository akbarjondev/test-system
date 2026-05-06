# 🟠 HIGH PATCHES

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
