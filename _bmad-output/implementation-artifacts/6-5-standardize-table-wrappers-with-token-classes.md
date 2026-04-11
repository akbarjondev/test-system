# Story 6.5: Standardize Table Wrappers With Token Classes

Status: done

## Story

As an admin dashboard maintainer,
I want every HTML `<Table>` on dashboard pages wrapped in a consistent bordered surface using design tokens,
So that tables match card surfaces, respect dark mode, and avoid one-off `border-zinc` / `bg-white` wrappers.

## Acceptance Criteria

1. **Given** a page under `apps/admin-dashboard/app/dashboard/` that renders the shadcn `<Table>` component from `@/components/ui/table`,
   **When** the table is in its non-empty state,
   **Then** the `<Table>` is wrapped in a single parent `<div>` with **exactly** these utility classes: `rounded-xl border border-border overflow-hidden bg-card` (order of classes may vary; semantics must match).

2. **Given** empty states (e.g. “no rows” message) beside a table on the same page,
   **When** the empty state is shown instead of the table,
   **Then** the wrapper div is **not** incorrectly wrapped around the empty-state paragraph — only the `<Table>` subtree per epic design notes.

3. **Given** `DataTable` or other abstractions that render tables internally,
   **When** they appear on dashboard routes,
   **Then** either (a) the abstraction applies the same wrapper externally, or (b) the abstraction’s outer container uses the same token surface pattern — developer must choose one consistent pattern and document it in Completion Notes.

4. **Given** `npm run build` in `apps/admin-dashboard`,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Inventory all `<Table` usages (AC: #1–#3)
  - [x] Search `apps/admin-dashboard/app/dashboard` for `<Table` and for `DataTable` usage

- [x] Task 2: Fix / verify each location (AC: #1, #2)
  - [x] `app/dashboard/page.tsx` — recent attempts table
  - [x] `app/dashboard/students/page.tsx` — users table (coordinate with Story 6.8 if wrapper already present — do not duplicate wrappers)

- [x] Task 3: `TestsTable` / `DataTable` (AC: #3)
  - [x] `app/dashboard/tests/ui/TestsTable.tsx` — ensure visual container matches token wrapper pattern (may be in `components/data-table` — only edit if required to meet AC)

- [x] Task 4: Build + visual smoke test (AC: #4)
  - [x] `npm run build`
  - [x] Manually spot-check light/dark for one list page

## Dev Notes

### Wrapper pattern (canonical)

```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>...</Table>
</div>
```

### Sidebar

- Exempt from this story’s file edits.

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Boundaries, Phase 3 dashboard table wrapper]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `dashboard/page.tsx` and `students/page.tsx` already wrapped `<Table>` in `rounded-xl border border-border overflow-hidden bg-card`.
- Centralized fix: `components/data-table.tsx` table surface updated from `rounded-md border` to the same token wrapper pattern so `TestsTable`, `ResultsTable`, and `UsersTable` inherit it without per-page duplication.

### File List

- `apps/admin-dashboard/components/data-table.tsx`

## Change Log

- 2026-04-11: Story created — standardize table wrappers (Epic 6)
- 2026-04-11: Dev-story — DataTable wrapper aligned; status → `review`
