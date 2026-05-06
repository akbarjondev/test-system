# 1. Design Tokens

All tokens are defined in `apps/admin-dashboard/app/globals.css` using the OKLCH color space. They are referenced in Tailwind via the `@theme inline` block, making them available as Tailwind utilities (e.g., `bg-card`, `text-muted-foreground`, `border-border`).

### 1.1 Color Tokens

#### Light Mode

| CSS Variable | Tailwind Utility | Value | Intended Use |
|---|---|---|---|
| `--background` | `bg-background` | `oklch(1 0 0)` — white | Page background |
| `--foreground` | `text-foreground` | `oklch(0.145 0 0)` — near-black | Primary body text |
| `--card` | `bg-card` | `oklch(1 0 0)` — white | Card & panel surfaces |
| `--card-foreground` | `text-card-foreground` | `oklch(0.145 0 0)` | Text on card surfaces |
| `--primary` | `bg-primary` | `oklch(0.205 0 0)` — charcoal | Primary buttons, active nav |
| `--primary-foreground` | `text-primary-foreground` | `oklch(0.985 0 0)` | Text on primary bg |
| `--secondary` | `bg-secondary` | `oklch(0.97 0 0)` — very light gray | Secondary buttons |
| `--secondary-foreground` | `text-secondary-foreground` | `oklch(0.205 0 0)` | Text on secondary bg |
| `--muted` | `bg-muted` | `oklch(0.97 0 0)` | Muted/disabled backgrounds |
| `--muted-foreground` | `text-muted-foreground` | `oklch(0.556 0 0)` — medium gray | Secondary & helper text |
| `--destructive` | `bg-destructive` / `text-destructive` | `oklch(0.577 0.245 27.325)` — red | Delete, error, danger |
| `--border` | `border-border` | `oklch(0.922 0 0)` — light gray | All dividers and borders |
| `--input` | `border-input` | `oklch(0.922 0 0)` | Input field borders |
| `--ring` | `ring-ring` | `oklch(0.708 0 0)` | Focus ring color |
| `--sidebar` | `bg-sidebar` | `oklch(0.985 0 0)` | Sidebar background |

#### Dark Mode

| CSS Variable | Dark Value | Change |
|---|---|---|
| `--background` | `oklch(0.145 0 0)` | Inverted to near-black |
| `--card` | `oklch(0.205 0 0)` | Dark gray panels |
| `--primary` | `oklch(0.922 0 0)` | Light gray (inverted) |
| `--muted-foreground` | `oklch(0.708 0 0)` | Lighter gray in dark |
| `--border` | `oklch(1 0 0 / 10%)` | 10% white overlay |
| `--sidebar` | `oklch(0.205 0 0)` | Dark sidebar |

### 1.2 Semantic Color Rules

These rules must be followed everywhere in the codebase. Using raw Tailwind palette classes (e.g., `text-gray-500`, `bg-white`) instead of tokens breaks dark mode and makes global theme changes impossible.

| Situation | Use This | Never Use |
|---|---|---|
| Secondary / helper text | `text-muted-foreground` | `text-gray-500`, `text-zinc-500`, `text-zinc-400` |
| Any border line | `border-border` | `border-zinc-200 dark:border-zinc-800` |
| Card / panel background | `bg-card` | `bg-white dark:bg-zinc-900` |
| Success status text/bg | `<Badge variant="success">` | `text-green-600`, `text-green-800` |
| Error / fail status | `<Badge variant="error">` | `text-red-500`, `text-red-600` |
| Warning status | `<Badge variant="warning">` | `border-amber-400`, `text-amber-500` |
| Admin role indicator | `<Badge variant="default">` | `text-blue-600` |
| Student role indicator | `<Badge variant="secondary">` | `text-gray-600` |
| Delete / danger action | `variant="destructive"` on Button | `text-red-500` inline |

### 1.3 Missing Tokens (to add)

The following semantic tokens do not yet exist in `globals.css`. They are currently hardcoded in `badge.tsx` and a few pages. Adding them here allows future theme changes from a single place.

Add to `apps/admin-dashboard/app/globals.css` inside `:root {}`:

```css
/* Status colors */
--success: oklch(0.45 0.15 150);           /* green */
--success-foreground: oklch(0.97 0 0);
--error: oklch(0.55 0.2 25);              /* red */
--error-foreground: oklch(0.97 0 0);
--warning: oklch(0.75 0.15 85);           /* amber */
--warning-foreground: oklch(0.2 0 0);
```

Add to `.dark {}`:

```css
--success: oklch(0.55 0.18 150);
--success-foreground: oklch(0.145 0 0);
--error: oklch(0.65 0.2 25);
--error-foreground: oklch(0.145 0 0);
--warning: oklch(0.8 0.18 85);
--warning-foreground: oklch(0.145 0 0);
```

Also add to `@theme inline {}`:

```css
--color-success: var(--success);
--color-success-foreground: var(--success-foreground);
--color-error: var(--error);
--color-error-foreground: var(--error-foreground);
--color-warning: var(--warning);
--color-warning-foreground: var(--warning-foreground);
```

### 1.4 Typography

Font family: **Geist Sans** (loaded via `next/font/google`, CSS variable `--font-geist-sans`)
Mono font: **Geist Mono** (`--font-geist-mono`) — used in code contexts only

| Role | Classes | Example |
|---|---|---|
| Page title (H1) | `text-2xl font-bold` | "Bosh sahifa" |
| Section heading (H2) | `text-lg font-semibold` | "So'nggi urinishlar" |
| Page subtitle | `text-sm text-muted-foreground mt-1` | "Tizim holati haqida..." |
| Body / table content | `text-sm` (default) | Regular data |
| Table cell emphasis | `text-sm font-medium` | Student name |
| Helper / label text | `text-sm text-muted-foreground` | Field labels in detail views |
| Large metric | `text-4xl font-bold` | Stat card numbers |

### 1.5 Border Radius

Base radius: `0.625rem` (10px), defined as `--radius`.

| Token | Tailwind Class | Value | Use |
|---|---|---|---|
| `--radius-sm` | `rounded-sm` | 6px | Small elements |
| `--radius-md` | `rounded-md` | 8px | Inputs, question list items |
| `--radius-lg` | `rounded-lg` | 10px | General purpose |
| `--radius-xl` | `rounded-xl` | 14px | Cards, table wrappers, stat cards |
| `--radius-full` | `rounded-full` | 9999px | Badges, pills |

### 1.6 Spacing

Consistent spacing prevents the "every page is slightly different" problem. Use these standards:

| Context | Class | Value |
|---|---|---|
| Between major page sections | `space-y-8` | 2rem |
| Between related sub-sections | `space-y-6` | 1.5rem |
| Stat card grid gap | `gap-4` | 1rem |
| Form field group gap | `gap-6` | 1.5rem |
| Below page H1 (if no subtitle) | `mb-6` | 1.5rem |
| Below section H2 | `mb-4` | 1rem |
| Between sibling action buttons | `gap-2` | 0.5rem |
| Card internal padding | `p-6` | 1.5rem |
| Mobile page padding | `p-4` | 1rem |

---
