# Story 4.4: Pass/Fail Results in Dashboard

Status: review

## Story

As a teacher,
I want to see pass/fail status and attempt state for each student in the results table,
So that I can quickly assess class performance.

## Acceptance Criteria

1. **Given** a teacher views the results page for a test with `passingScore` set,
   **When** the results table renders,
   **Then** each row shows a status badge: "O'tdi" (green), "O'tmadi" (red), "Vaqt tugadi" (orange), "Jarayonda" (gray)
   **And** the badge is implemented using the shadcn Badge component

2. **Given** a test has no `passingScore` set,
   **When** the results table renders,
   **Then** no pass/fail badge is shown — only the score and status columns

3. **Given** an attempt has `timedOutAt` set,
   **When** the results table renders,
   **Then** the row shows "Vaqt tugadi" badge regardless of score

## Tasks / Subtasks

- [x] Task 1: Find the test results page in the admin dashboard
  - [x] Glob: `apps/admin-dashboard/app/dashboard/tests/[id]/**/*.tsx`
  - [x] Identify the component that renders attempt results

- [x] Task 2: Update the results server action or fetch logic
  - [x] Ensure the results fetch includes `passed`, `status`, `timedOutAt` from the API response (Story 4.2 adds these)
  - [x] Update the TypeScript type for attempt data to include `passed: boolean | null`, `status: string`, `timedOutAt: string | null`

- [x] Task 3: Add shadcn Badge to results table
  - [x] Import `Badge` from `@/components/ui/badge` (already in packages/ui or dashboard)
  - [x] Add a "Natija" column to the DataTable
  - [x] Render badge based on data:
    - `timedOutAt` not null → `<Badge variant="outline" className="bg-orange-100 text-orange-700">Vaqt tugadi</Badge>`
    - `passed === true` → `<Badge className="bg-green-100 text-green-700">O'tdi</Badge>`
    - `passed === false` → `<Badge className="bg-red-100 text-red-700">O'tmadi</Badge>`
    - `passed === null` → no badge (no passingScore set)
    - `status === "in_progress"` → `<Badge variant="outline">Jarayonda</Badge>`

- [x] Task 4: Add "Holat" column for attempt status
  - [x] Separate from pass/fail badge — shows attempt lifecycle state
  - [x] "Topshirilgan" for submitted, "Vaqt tugadi" for timed out, "Jarayonda" for in_progress

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/app/dashboard/tests/[id]/results/page.tsx` (or similar) | Add Badge column for pass/fail and status |

**Note:** Dev agent must glob to find actual file paths before editing.

### Badge Import Pattern

```tsx
import { Badge } from "@/components/ui/badge";
// or: import { Badge } from "@test-system/ui";
```

### Badge Rendering Pattern

```tsx
// In DataTable column definition:
{
  accessorKey: "passed",
  header: "Natija",
  cell: ({ row }) => {
    const { passed, timedOutAt, status } = row.original;

    if (timedOutAt) {
      return <Badge variant="outline" className="border-orange-300 text-orange-700">Vaqt tugadi</Badge>;
    }
    if (status === "in_progress") {
      return <Badge variant="outline">Jarayonda</Badge>;
    }
    if (passed === true) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">O'tdi</Badge>;
    }
    if (passed === false) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">O'tmadi</Badge>;
    }
    return null; // no passingScore set
  },
},
```

### Dependency

Story 4.2 must be merged first — API must return `passed` and `status` in attempts response.

### References

- [Source: apps/admin-dashboard/actions/tests.ts] — Fetch pattern for test data
- Glob: `apps/admin-dashboard/app/dashboard/tests/**/*.tsx` — Find results page

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Task 1: Results page located at `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx`. The component `ResultsTable` renders attempts with a `DataTable`.
- Task 2: `EnrichedAttempt` type already had `passed: boolean | null`, `status: string`, and `timedOutAt: string | null` — no type changes needed.
- Task 3: Updated `NatijaCell` to check `timedOutAt` first (highest priority → `variant="warning"` orange), then `status === "in_progress"` (→ `variant="outline"` gray), then `passed === true` (→ `variant="success"` green), then `passed === false` (→ `variant="error"` red), then `null` for no passingScore. Used existing Badge variants from `@/components/ui/badge` which already had `success`, `error`, `warning`, and `outline` variants.
- Task 4: Updated "Holat" column from plain text to Badge components: `submitted` → `variant="success"` "Topshirilgan", `timed_out` → `variant="warning"` "Vaqt tugadi", default → `variant="outline"` "Jarayonda".
- No test framework configured in admin-dashboard; this is a frontend UI component story with no automated test suite.

### File List

- `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx`

## Change Log

- 2026-04-09: Implemented pass/fail badges in results table — updated NatijaCell with timedOutAt/in_progress/passed priority logic and added Badge variants to Holat column. (Amelia, claude-sonnet-4-6)
