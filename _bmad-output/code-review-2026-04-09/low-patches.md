# 🟢 LOW PATCHES

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
