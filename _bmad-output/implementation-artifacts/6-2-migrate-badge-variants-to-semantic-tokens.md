# Story 6.2: Migrate Badge Variants to Semantic Tokens

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin dashboard maintainer,
I want `Badge` success/error/warning variants to use semantic design tokens instead of hardcoded Tailwind palette classes,
So that status badges stay consistent and render correctly in light and dark mode.

## Acceptance Criteria

1. **Given** Story 6.1 is merged (semantic tokens in `globals.css`),
   **When** inspecting `apps/admin-dashboard/components/ui/badge.tsx`,
   **Then** `success`, `error`, and `warning` variant classes use only token-backed utilities (`bg-success`, `text-success-foreground`, `bg-error`, `text-error-foreground`, `bg-warning`, `text-warning-foreground`) — no `bg-green-*`, `bg-red-*`, `text-green-*`, `text-red-*`, or `bg-orange-*` / `text-amber-*` style literals.

2. **Given** the file is saved,
   **When** `cd apps/admin-dashboard && npm run build` runs,
   **Then** the build completes with exit code 0.

3. **Given** the epic verification command,
   **When** `grep -E "bg-green-|bg-red-|bg-orange-|text-green-|text-red-" apps/admin-dashboard/components/ui/badge.tsx` runs,
   **Then** there are zero matches.

## Tasks / Subtasks

- [x] Task 1: Audit `badge.tsx` variants (AC: #1, #3)
  - [x] Confirm `success` / `error` / `warning` map to semantic utilities only
  - [x] If any hardcoded palette classes remain, replace with token utilities

- [x] Task 2: Build verification (AC: #2)
  - [x] Run `npm run build` from `apps/admin-dashboard`

- [x] Task 3: Optional consistency — `destructive` variant (AC: #1)
  - [x] Epic text focused on lines 14–16; if `destructive` still uses `text-white` while other variants use `-foreground` tokens, align with existing shadcn/destructive pattern only if it does not change visible UX unexpectedly

## Dev Notes

### Prerequisite

- **Story 6.1** (`6-1-add-semantic-status-color-tokens.md`) must be **done or in review** with tokens present in `globals.css`. If tokens are missing, implement 6.1 first.

### Canonical implementation (target state)

From epic [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md` — Phase 2]:

```text
success: "bg-success text-success-foreground"
error:   "bg-error text-error-foreground"
warning: "bg-warning text-warning-foreground"
```

### Files in scope

- **Primary:** `apps/admin-dashboard/components/ui/badge.tsx`
- **Out of scope:** API, bot, `packages/*`, Sidebar (different epic exemption note applies to color sweeps, not this file)

### Project rules (do not violate)

- No new npm dependencies without explicit approval
- No `console.log`
- TypeScript strict — keep `VariantProps` / `cva` typings valid

### References

- Epic intent and frozen constraints: [Source: `_bmad-output/implementation-artifacts/spec-epic-6-design-system.md`]
- Project-wide rules: [Source: `_bmad-output/project-context.md`]

## Dev Agent Record

### Agent Model Used

Cursor Agent (GPT-5.1)

### Debug Log References

None

### Completion Notes List

- Confirmed `success` / `error` / `warning` in `badge.tsx` already use `bg-success text-success-foreground`, `bg-error text-error-foreground`, and `bg-warning text-warning-foreground` with no `bg-green-*`, `bg-red-*`, or palette literals (grep over file: zero matches for AC3 patterns).
- `npm run build` in `apps/admin-dashboard` completed successfully (exit 0).
- `npm run lint` completed with 0 errors (3 pre-existing react-hooks warnings in other files).
- Left `destructive` as `bg-destructive text-white`: theme has no `--destructive-foreground` / `text-destructive-foreground` mapping in `globals.css`, so switching would be speculative; optional Task 3 satisfied by explicit review and no change.

### File List

- _(no source edits — implementation already matched story scope)_

## Change Log

- 2026-04-11: Story created — migrate Badge variants to semantic tokens (Epic 6)
- 2026-04-11: Dev-story — verified ACs against repo; no `badge.tsx` edits required; status → `review`; sprint `6-2` → `review`
