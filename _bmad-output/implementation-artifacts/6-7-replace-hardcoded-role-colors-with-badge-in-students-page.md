# Story 6.7: Replace Hardcoded Role Colors With Badge on Students Page

Status: done

## Story

As an admin dashboard maintainer,
I want the students list “Rol” column to represent roles exclusively via `Badge` variants,
So that role chips match the design system and never rely on one-off `text-blue-*` / `text-gray-*` spans.

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/dashboard/students/page.tsx` (or its extracted table component if refactored),
   **When** `user.role === "ADMIN"`,
   **Then** the cell shows `<Badge variant="default">` with the **exact** same visible label text as before (preserve Uzbek / admin labeling).

2. **Given** `user.role === "STUDENT"` (or `"STUDENT"` enum as defined in the page types),
   **Then** the cell shows `<Badge variant="secondary">` (or the variant chosen in epic) with the **exact** same visible student label as before.

3. **Given** grep for `text-blue-` or `text-gray-` in that page’s role-rendering JSX,
   **Then** zero matches.

4. **Given** `npm run build`,
   **Then** exit code 0.

## Tasks / Subtasks

- [x] Task 1: Verify or implement role badges (AC: #1, #2)
  - [x] Ensure `Badge` import from `@/components/ui/badge`
  - [x] Remove any residual span-based role coloring

- [x] Task 2: Related users table (AC: #1–#3)
  - [x] If `/dashboard/users` route uses `UsersTable.tsx` with gray `Badge` overrides, align with same variant pattern as students page for consistency (coordinate with Story 6.4 if that file is already touched there — avoid conflicting edits: use one story or combine in a single PR sequence)

- [x] Task 3: Build (AC: #4)
  - [x] `npm run build`

## Dev Notes

### File scope

- **Primary:** `apps/admin-dashboard/app/dashboard/students/page.tsx`
- **Possibly related:** `apps/admin-dashboard/app/dashboard/users/ui/UsersTable.tsx` (if roles duplicated)

### Prerequisite

- Badge semantic variants from **6.1 / 6.2**.

### References

- [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Students page, Story 6.7]
- [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- `students/page.tsx` already used `Badge variant="default|secondary"` for roles.
- `users/ui/UsersTable.tsx` updated in same Epic 6 batch (Story 6.4) to the same variant pattern; grep shows no `text-blue-` / `text-gray-` on role badges.
- `npm run build`: success.

### File List

- `apps/admin-dashboard/app/dashboard/users/ui/UsersTable.tsx` _(role badges; coordinated with Story 6.4)_
- _(students page — verified compliant, no edit)_

## Change Log

- 2026-04-11: Story created — role column uses Badge (Epic 6)
- 2026-04-11: Dev-story — verified + UsersTable aligned; status → `review`
