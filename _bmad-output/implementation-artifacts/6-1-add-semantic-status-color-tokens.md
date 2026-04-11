# Story 6.1: Add Semantic Status Color Tokens

Status: ready-for-dev

## Story

As an admin dashboard maintainer,
I want semantic CSS tokens for success, error, and warning states,
So that status colors adapt correctly to light/dark mode and can be changed from one place.

## Acceptance Criteria

1. **Given** `apps/admin-dashboard/app/globals.css` `:root {}` block,
   **When** the dev adds the six new tokens,
   **Then** `--success`, `--success-foreground`, `--error`, `--error-foreground`, `--warning`, `--warning-foreground` each have a valid OKLCH value

2. **Given** `.dark {}` block in `globals.css`,
   **When** the dev adds dark-mode overrides,
   **Then** all six tokens have dark-mode OKLCH values that are visually legible on dark backgrounds

3. **Given** `@theme inline {}` block in `globals.css`,
   **When** the dev adds Tailwind mappings,
   **Then** `--color-success`, `--color-success-foreground`, `--color-error`, `--color-error-foreground`, `--color-warning`, `--color-warning-foreground` each map to their CSS variable counterparts

4. **Given** the tokens are in place,
   **When** a component uses utility classes `bg-success`, `text-success-foreground`, `bg-error`, `text-error-foreground`, `bg-warning`, `text-warning-foreground`,
   **Then** they resolve to the correct themed colors in both light and dark mode

## Tasks / Subtasks

- [ ] Task 1: Add tokens to `:root {}` in `globals.css`
  - [ ] Add after existing tokens (before closing `}`) in the `:root {}` block
  - [ ] Add `--success`, `--success-foreground`, `--error`, `--error-foreground`, `--warning`, `--warning-foreground`

- [ ] Task 2: Add dark-mode overrides to `.dark {}` in `globals.css`
  - [ ] Add matching dark-mode values for all six tokens inside `.dark {}`

- [ ] Task 3: Add Tailwind mappings to `@theme inline {}` in `globals.css`
  - [ ] Add `--color-success`, `--color-success-foreground`, `--color-error`, `--color-error-foreground`, `--color-warning`, `--color-warning-foreground` mappings

- [ ] Task 4: Verify utility classes work
  - [ ] Confirm `text-success`, `bg-success`, `text-error`, `bg-error`, `text-warning`, `bg-warning`, and their `-foreground` variants are available (no build step needed — Tailwind resolves these from `@theme inline`)

## Dev Notes

### Single File to Touch

**ONLY** edit `apps/admin-dashboard/app/globals.css`. No TypeScript changes, no component changes, no new files.

### Exact OKLCH Values to Use

Use these values — they are chosen to match the project's existing OKLCH palette style and pass contrast requirements:

**Light mode (add inside `:root {}`):**
```css
--success: oklch(0.648 0.150 148);
--success-foreground: oklch(0.985 0 0);
--error: oklch(0.628 0.222 25);
--error-foreground: oklch(0.985 0 0);
--warning: oklch(0.769 0.189 84);
--warning-foreground: oklch(0.205 0 0);
```

**Dark mode (add inside `.dark {}`):**
```css
--success: oklch(0.723 0.160 148);
--success-foreground: oklch(0.145 0 0);
--error: oklch(0.704 0.191 22);
--error-foreground: oklch(0.985 0 0);
--warning: oklch(0.828 0.189 84);
--warning-foreground: oklch(0.205 0 0);
```

**Tailwind mappings (add inside `@theme inline {}`):**
```css
--color-success: var(--success);
--color-success-foreground: var(--success-foreground);
--color-error: var(--error);
--color-error-foreground: var(--error-foreground);
--color-warning: var(--warning);
--color-warning-foreground: var(--warning-foreground);
```

### Exact Insertion Points in globals.css

The file currently has three blocks that need edits:

1. **`@theme inline {}` block** (lines 6–47): Add the 6 `--color-*` mappings after `--color-card-foreground: var(--card-foreground);` line (before the radius lines)

2. **`:root {}` block** (lines 49–82): Add the 6 `--*` tokens after `--sidebar-ring: oklch(0.708 0 0);` (before closing `}`)

3. **`.dark {}` block** (lines 84–116): Add the 6 dark `--*` tokens after `--sidebar-ring: oklch(0.556 0 0);` (before closing `}`)

### Why OKLCH (not hex/hsl)

The entire project uses OKLCH color format (see globals.css — every existing token uses `oklch(...)`). Using OKLCH is mandatory to stay consistent with the project pattern.

### Downstream Dependency Warning

Stories 6.2, 6.6, 6.7, and 6.9 all depend on these tokens. Do not skip or alter the token names — downstream stories reference them by exact name.

### Utility Class Names That Will Work After This Story

After this story, the following Tailwind classes will be usable in any dashboard component:
- `bg-success` / `text-success` / `text-success-foreground`
- `bg-error` / `text-error` / `text-error-foreground`
- `bg-warning` / `text-warning` / `text-warning-foreground`
- `border-success` / `border-error` / `border-warning`

### No npm Install Required

No new packages needed. This is a pure CSS change. Tailwind reads `@theme inline {}` to generate utilities — no configuration file change needed.

### Pattern Reference

The existing `--destructive` token in globals.css follows the same pattern (defined in `:root`, overridden in `.dark`, mapped in `@theme inline`). Mirror that exact structure.

```css
/* Existing destructive pattern (reference only): */
/* In :root:     --destructive: oklch(0.577 0.245 27.325); */
/* In .dark:     --destructive: oklch(0.704 0.191 22.216); */
/* In @theme:    --color-destructive: var(--destructive); */
```

## Dev Agent Record

### Agent Model Used

_fill in_

### Debug Log References

_fill in_

### Completion Notes List

_fill in_

### File List

- `apps/admin-dashboard/app/globals.css` — Add semantic color tokens to `:root`, `.dark`, and `@theme inline` blocks

## Change Log

- 2026-04-11: Story 6.1 created — Add Semantic Status Color Tokens (foundation for Epic 6 design system)
