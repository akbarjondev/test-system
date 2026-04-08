# Story 5.3: Test Results Page

Status: ready-for-dev

## Story

As a teacher,
I want to see a detailed results table for each test,
So that I can evaluate how students performed.

## Acceptance Criteria

1. **Given** a teacher navigates to `/dashboard/tests/:id/results`,
   **When** the page loads,
   **Then** a DataTable shows columns: Talaba ismi, Ball, Maksimal ball, Natija, Holat, Topshirilgan vaqt, Sarflangan vaqt
   **And** the Natija column shows a shadcn Badge: "O'tdi" (green), "O'tmadi" (red), or empty if no passingScore set
   **And** the Holat column shows: "Topshirilgan", "Vaqt tugadi", or "Jarayonda"

2. **Given** no attempts exist for the test,
   **When** the page loads,
   **Then** an empty state is shown: "Hali hech kim bu testni topshirmagan."

## Tasks / Subtasks

- [ ] Task 1: Find the existing results page
  - [ ] Glob: `apps/admin-dashboard/app/dashboard/tests/[id]/**/*.tsx`
  - [ ] Read current results page implementation

- [ ] Task 2: Replace or update the attempts table with DataTable
  - [ ] Use shadcn DataTable (from Story 5.1) with new column definitions
  - [ ] Columns:
    - **Talaba ismi**: `student.fullName ?? student.email ?? "Noma'lum"`
    - **Ball**: `attempt.score ?? 0`
    - **Maksimal ball**: computed from `questionCount * pointsPerQuestion`
    - **Natija**: Badge based on `attempt.passed` (green O'tdi / red O'tmadi / null = empty)
    - **Holat**: "Topshirilgan" / "Vaqt tugadi" / "Jarayonda"
    - **Topshirilgan vaqt**: formatted `attempt.submittedAt`
    - **Sarflangan vaqt**: computed from `startedAt` to `submittedAt`

- [ ] Task 3: Fetch enriched attempt data
  - [ ] Call `GET /api/tests/:testId/attempts` — response now includes `passed` and `status` (Story 4.2)
  - [ ] Include student name in response — check if API currently returns `student.fullName`
  - [ ] Update server action/fetch if needed to include student fullName

- [ ] Task 4: Add empty state
  - [ ] If `attempts.length === 0`: show "Hali hech kim bu testni topshirmagan."

- [ ] Task 5: Compute "Sarflangan vaqt" (time spent)
  - [ ] `timeTaken = (submittedAt - startedAt) / 1000 / 60` — format as "X daqiqa Y soniya"
  - [ ] If not submitted (in_progress): show "-"

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

### Completion Notes List

### File List
