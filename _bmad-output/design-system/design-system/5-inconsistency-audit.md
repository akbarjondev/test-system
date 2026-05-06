# 5. Inconsistency Audit

All issues found across dashboard pages. Each row maps to a dev task in Section 6.

### `apps/admin-dashboard/app/dashboard/page.tsx`

| Issue # | Line(s) | Problem | Fix |
|---|---|---|---|
| 1 | 41 | `StatCard` raw `div`: `bg-white dark:bg-zinc-900` | Use `<Card>` + `<CardContent>` |
| 2 | 41 | `border-zinc-200 dark:border-zinc-800` on StatCard | Use `border-border`; for warning use `border-warning` |
| 3 | 42 | `text-zinc-500 dark:text-zinc-400` label text | Use `text-muted-foreground` |
| 4 | 43 | `text-amber-500` on warning value | Use `text-warning` (after DS-1) |
| 5 | 134–141 | `text-green-600` / `text-red-500` inline spans for pass/fail | Replace with `<Badge variant="success">` / `<Badge variant="error">` |
| 6 | 97 | Table wrapper: `border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900` | Use `border-border bg-card` |
| 7 | 95 | Empty state: `text-sm text-zinc-500` | Use `text-sm text-muted-foreground` |

### `apps/admin-dashboard/app/dashboard/students/page.tsx`

| Issue # | Line(s) | Problem | Fix |
|---|---|---|---|
| 8 | 41 | `text-gray-500` empty state | Use `text-muted-foreground` |
| 9 | 63–69 | `text-blue-600 font-medium` / `text-gray-600` for roles | Use `<Badge variant="default">` / `<Badge variant="secondary">` |
| 10 | 43 | `<Table>` not wrapped in styled container | Add `rounded-xl border border-border overflow-hidden bg-card` div |
| 11 | 38 | H1 has no subtitle | Add `<p className="text-sm text-muted-foreground mt-1">` |

### `apps/admin-dashboard/app/dashboard/tests/[id]/page.tsx`

| Issue # | Line(s) | Problem | Fix |
|---|---|---|---|
| 12 | 46,50,54,57,61,67,71 | `text-gray-500` on metadata labels | Use `text-muted-foreground` |
| 13 | 118–122 | `text-green-600` / `text-red-500` on question option correctness | Use `text-success` / `text-error` (after DS-1) |
| 14 | 95 | `border rounded-md p-3` — bare `border` class | Use `border border-border` for explicit token reference |

### `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx`

| Issue # | Line(s) | Problem | Fix |
|---|---|---|---|
| 15 | 121 | Empty state `text-gray-500` | Use `text-muted-foreground` |

### `apps/admin-dashboard/components/ui/badge.tsx`

| Issue # | Line(s) | Problem | Fix |
|---|---|---|---|
| 16 | 14 | `success: "bg-green-100 text-green-800"` | Use `bg-success text-success-foreground` (after DS-1) |
| 17 | 15 | `error: "bg-red-100 text-red-800"` | Use `bg-error text-error-foreground` |
| 18 | 16 | `warning: "bg-orange-100 text-orange-700"` | Use `bg-warning text-warning-foreground` |

---
