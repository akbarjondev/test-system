# Story 5.3: Test Results Page

Status: review

## Story

As a teacher,
I want to see a detailed results table for each test,
So that I can evaluate how students performed.

## Acceptance Criteria

1. **Given** a teacher navigates to `/dashboard/tests/:id/results`,
   **When** the page loads,
   **Then** a DataTable shows columns: Talaba ismi, Ball, Maksimal ball, Natija, Holat, Topshirilgan vaqt, Sarflangan vaqt
   **And** the Natija column shows a shadcn Badge: "O'tdi" (green), "O'tmadi" (red), or empty if no passingScore set
   **And** the Holat column shows: "Topshirildan", "Vaqt tugadi", or "Jarayonda"

2. **Given** no attempts exist for the test,
   **When** the page loads,
   **Then** an empty state is shown: "Hali hech kim bu testni topshirmagan."

## Tasks / Subtasks

- [x] Task 1: Find the existing results page
  - [x] Glob: `apps/admin-dashboard/app/dashboard/tests/[id]/**/*.tsx`
  - [x] Read current results page implementation

- [x] Task 2: Replace or update the attempts table with DataTable
  - [x] Use shadcn DataTable (from Story 5.1) with new column definitions
  - [x] Columns:
    - **Talaba ismi**: `student.fullName ?? student.email ?? "Noma'lum"`
    - **Ball**: `attempt.score ?? 0`
    - **Maksimal ball**: computed from `questionCount * pointsPerQuestion`
    - **Natija**: Badge based on `attempt.passed` (green O'tdi / red O'tmadi / null = empty)
    - **Holat**: "Topshirilgan" / "Vaqt tugadi" / "Jarayonda"
    - **Topshirilgan vaqt**: formatted `attempt.submittedAt`
    - **Sarflangan vaqt**: computed from `startedAt` to `submittedAt`

- [x] Task 3: Fetch enriched attempt data
  - [x] Call `GET /api/tests/:testId/attempts` — response now includes `passed` and `status` (Story 4.2)
  - [x] Include student name in response — check if API currently returns `student.fullName`
  - [x] Update server action/fetch if needed to include student fullName

- [x] Task 4: Add empty state
  - [x] If `attempts.length === 0`: show "Hali hech kim bu testni topshirmagan."

- [x] Task 5: Compute "Sarflangan vaqt" (time spent)
  - [x] `timeTaken = (submittedAt - startedAt) / 1000 / 60` — format as "X daqiqa Y soniya"
  - [x] If not submitted (in_progress): show "-"

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/app/dashboard/tests/[id]/results/page.tsx` (or similar) | Replace table with DataTable, add Badge columns |

**Note:** Dev agent must glob to find actual results page path first.

### Column Definitions Pattern

```tsx
const columns: ColumnDef<EnrichedAttempt>[] = [
  {
    accessorKey: "studentName",
    header: "Talaba ismi",
    cell: ({ row }) => row.original.student?.fullName ?? row.original.student?.email ?? "Noma'lum",
  },
  {
    accessorKey: "score",
    header: "Ball",
    cell: ({ row }) => row.original.score ?? 0,
  },
  {
    id: "natija",
    header: "Natija",
    cell: ({ row }) => {
      const { passed, timedOutAt } = row.original;
      if (timedOutAt) return <Badge variant="outline" className="text-orange-700">Vaqt tugadi</Badge>;
      if (passed === true) return <Badge className="bg-green-100 text-green-800">O'tdi</Badge>;
      if (passed === false) return <Badge className="bg-red-100 text-red-800">O'tmadi</Badge>;
      return null;
    },
  },
  {
    id: "holat",
    header: "Holat",
    cell: ({ row }) => {
      const { status } = row.original;
      if (status === "submitted") return "Topshirilgan";
      if (status === "timed_out") return "Vaqt tugadi";
      return "Jarayonda";
    },
  },
];
```

### Dependency

Story 4.2 must be merged first — API must return `passed` and `status` in attempts response.
Story 5.1 must be merged first — DataTable component must exist.

### References

- [Source: apps/admin-dashboard/actions/tests.ts] — Fetch pattern
- Glob: `apps/admin-dashboard/app/dashboard/tests/[id]/**/*.tsx` — Find results page

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Story 4.2 not yet implemented; `passed` and `status` fields computed in `AttemptsService.getTestAttempts` directly in this story.
- `student.fullName` added to `AttemptsRepository.getAttemptsByTest` Prisma select.
- Badge UI component created (`components/ui/badge.tsx`) — was missing from codebase.
- ResultsTable extracted into a separate `"use client"` component (`results-table.tsx`) to allow DataTable (client component) to be used from the server page.

### Completion Notes List

- Implemented `ResultsTable` client component with all 7 required columns using DataTable from Story 5.1.
- Added `Badge` UI component (`components/ui/badge.tsx`) with success/error/warning/outline variants.
- Updated `AttemptsRepository.getAttemptsByTest` to include `student.fullName` in the Prisma select.
- Updated `AttemptsService.getTestAttempts` to compute `passed` (boolean | null based on `passingScore`) and `status` ("submitted" | "timed_out" | "in_progress") for each attempt.
- Server page (`results/page.tsx`) fetches test + attempts, computes `maxScore = questionCount * pointsPerQuestion`, and passes enriched data to `ResultsTable`.
- Empty state "Hali hech kim bu testni topshirmagan." shown when `attempts.length === 0`.
- "Sarflangan vaqt" formatted as "X daqiqa Y soniya"; shows "-" for in-progress attempts.
- TypeScript compiles cleanly (zero errors in admin-dashboard and api).

### File List

- `apps/admin-dashboard/app/dashboard/tests/[id]/results/page.tsx` — rewritten (server page, fetches data, renders ResultsTable)
- `apps/admin-dashboard/app/dashboard/tests/[id]/results/results-table.tsx` — new (client component, DataTable + Badge column definitions)
- `apps/admin-dashboard/components/ui/badge.tsx` — new (Badge UI component)
- `apps/api/src/repositories/attempts.repository.ts` — updated (add `fullName` to student select in `getAttemptsByTest`)
- `apps/api/src/services/attempts.service.ts` — updated (`getTestAttempts` now returns enriched attempts with `passed` and `status`)

## Change Log

- 2026-04-09: Implemented Story 5.3 — Test Results Page with DataTable, Badge, and enriched API response (fullName, passed, status). All tasks complete.
