# Story 5.1: Tests List Page

Status: ready-for-dev

## Story

As a teacher,
I want to see all my tests in a clear, sortable table,
So that I can quickly find and manage any test.

## Acceptance Criteria

1. **Given** a teacher navigates to `/dashboard/tests`,
   **When** the page loads,
   **Then** tests are displayed in a shadcn DataTable with columns: Nomi, Savollar soni, Vaqt chegarasi, Holat, Amallar
   **And** the table supports sorting by name and creation date
   **And** the table supports pagination (10 rows per page default)
   **And** all column headers and action buttons are in Uzbek

2. **Given** no tests exist yet,
   **When** the page loads,
   **Then** an empty state message is shown in Uzbek: "Hali testlar yo'q. Yangi test yarating."
   **And** a prominent "Yangi test" button is visible

## Tasks / Subtasks

- [ ] Task 1: Find the existing tests list page
  - [ ] Glob: `apps/admin-dashboard/app/dashboard/tests/page.tsx`
  - [ ] Read the current implementation to understand what's already there

- [ ] Task 2: Replace existing table with shadcn DataTable
  - [ ] Import `DataTable` component — check if it exists in `packages/ui` or `apps/admin-dashboard/components/`
  - [ ] If DataTable does not exist, create it using shadcn/ui pattern with `@tanstack/react-table`
  - [ ] Define columns array with: Nomi, Savollar soni, Vaqt chegarasi, Holat, Amallar
  - [ ] All column header strings in Uzbek

- [ ] Task 3: Implement column definitions
  - [ ] **Nomi**: `accessorKey: "title"`, sortable
  - [ ] **Savollar soni**: `accessorKey: "_count.questions"` (or questions.length)
  - [ ] **Vaqt chegarasi**: `accessorKey: "timeLimitMinutes"`, format as "{n} daqiqa"
  - [ ] **Holat**: `accessorKey: "isAlwaysAvailable"`, show "Har doim" or date range
  - [ ] **Amallar**: render Edit (Tahrirlash) and Delete (O'chirish) buttons

- [ ] Task 4: Add empty state
  - [ ] If `tests.length === 0`, show: `<p>Hali testlar yo'q. Yangi test yarating.</p>` with a Link/Button to `/dashboard/tests/new`

- [ ] Task 5: Update "Yangi test" button to Uzbek
  - [ ] Ensure the create button text is "Yangi test" (not English)

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/app/dashboard/tests/page.tsx` | Replace with DataTable implementation |
| `apps/admin-dashboard/components/data-table.tsx` (create if missing) | DataTable component |

**Note:** Dev agent must read current page.tsx first to understand existing fetch/display logic before replacing.

### DataTable Column Definition Pattern

```tsx
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Test>[] = [
  {
    accessorKey: "title",
    header: "Nomi",
  },
  {
    accessorKey: "timeLimitMinutes",
    header: "Vaqt chegarasi",
    cell: ({ row }) => `${row.getValue("timeLimitMinutes")} daqiqa`,
  },
  {
    id: "actions",
    header: "Amallar",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/tests/${row.original.id}/edit`}>Tahrirlash</Link>
        </Button>
        {/* Delete button */}
      </div>
    ),
  },
];
```

### Empty State Pattern

```tsx
{tests.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground mb-4">Hali testlar yo'q. Yangi test yarating.</p>
    <Button asChild>
      <Link href="/dashboard/tests/new">Yangi test</Link>
    </Button>
  </div>
) : (
  <DataTable columns={columns} data={tests} />
)}
```

### shadcn DataTable Installation Note

If DataTable not present: `npx shadcn@latest add table` in `apps/admin-dashboard/`. Also needs `@tanstack/react-table` — check if already in package.json.

### References

- [Source: apps/admin-dashboard/app/dashboard/tests/page.tsx] — Current implementation
- [Source: apps/admin-dashboard/actions/tests.ts] — Fetch tests action pattern

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
