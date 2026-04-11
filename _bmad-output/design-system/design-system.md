# Admin Dashboard — Design System

**Project:** Test System Admin Dashboard
**Stack:** Next.js 16 · Tailwind CSS v4 · Radix UI · Lucide Icons
**Status:** Living document — update when tokens or components change

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
   - [Color Tokens](#11-color-tokens)
   - [Semantic Color Rules](#12-semantic-color-rules)
   - [Missing Tokens (to add)](#13-missing-tokens-to-add)
   - [Typography](#14-typography)
   - [Border Radius](#15-border-radius)
   - [Spacing](#16-spacing)
2. [Component Catalog](#2-component-catalog)
   - [Button](#21-button)
   - [Badge](#22-badge)
   - [Card](#23-card)
   - [Input & Field](#24-input--field)
   - [Table & DataTable](#25-table--datatable)
3. [Layout Patterns](#3-layout-patterns)
   - [Page Shell](#31-page-shell)
   - [Stat Cards Grid](#32-stat-cards-grid)
   - [Table Wrapper](#33-table-wrapper)
   - [Actions Row](#34-actions-row)
   - [Empty State](#35-empty-state)
4. [Navigation & Sidebar](#4-navigation--sidebar)
5. [Inconsistency Audit](#5-inconsistency-audit)
6. [Dev Task List](#6-dev-task-list)

---

## 1. Design Tokens

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

## 2. Component Catalog

All components live in `apps/admin-dashboard/components/ui/`.

### 2.1 Button

**File:** `components/ui/button.tsx`
Built with Class Variance Authority (CVA) on top of Radix UI Slot.

#### Variants

| Variant | Visual | Use |
|---|---|---|
| `default` | Charcoal fill, white text | Primary actions: Save, Create |
| `destructive` | Red fill, white text | Delete, Remove — irreversible |
| `outline` | Border only, transparent bg | Secondary actions: Edit, View |
| `secondary` | Light gray fill | Tertiary actions |
| `ghost` | Transparent, hover bg | Navigation links, icon buttons in sidebar |
| `link` | Underline on hover | In-text links |

#### Sizes

| Size | Height | Use |
|---|---|---|
| `sm` | h-8 | Compact table actions |
| `default` | h-9 | Standard |
| `lg` | h-10 | Prominent CTAs |
| `icon` | size-9 | Icon-only buttons |
| `icon-sm` | size-7 | Inline icon buttons (e.g., edit inside list) |

#### Usage Examples

```tsx
// Primary action
<Button>Saqlash</Button>

// Secondary with icon
<Button variant="outline" size="sm" asChild>
  <Link href="/edit"><PencilIcon className="size-4 mr-1" />Tahrirlash</Link>
</Button>

// Destructive
<Button variant="destructive" size="sm">O'chirish</Button>

// Icon only
<Button variant="outline" size="icon">
  <PencilIcon className="size-4" />
</Button>
```

### 2.2 Badge

**File:** `components/ui/badge.tsx`
Used exclusively for status indicators, roles, and labels — not for actions.

#### Variants

| Variant | Visual (current) | Visual (after DS-1/DS-2) | Use |
|---|---|---|---|
| `default` | Charcoal bg | Same | Admin role, general labels |
| `secondary` | Light gray | Same | Student role, neutral labels |
| `destructive` | Red bg | Same | Critical errors |
| `outline` | Border only | Same | Pending / in-progress status |
| `success` | `bg-green-100 text-green-800` | `bg-success text-success-foreground` | Passed, submitted |
| `error` | `bg-red-100 text-red-800` | `bg-error text-error-foreground` | Failed |
| `warning` | `bg-orange-100 text-orange-700` | `bg-warning text-warning-foreground` | Timed out, alerts |

#### Usage Examples

```tsx
// Attempt result
<Badge variant="success">O'tdi</Badge>
<Badge variant="error">O'tmadi</Badge>
<Badge variant="warning">Vaqt tugadi</Badge>
<Badge variant="outline">Jarayonda</Badge>

// User role
<Badge variant="default">Admin</Badge>
<Badge variant="secondary">O'quvchi</Badge>
```

### 2.3 Card

**File:** `components/ui/card.tsx`
Use Card and its sub-components instead of raw `div` with border/background classes.

#### Sub-components

| Component | Purpose |
|---|---|
| `Card` | Outer container — `rounded-xl border bg-card shadow-sm` |
| `CardHeader` | Top section — grid layout with auto-rows |
| `CardTitle` | Bold heading inside header |
| `CardDescription` | Muted subtitle inside header |
| `CardContent` | Main content area |
| `CardFooter` | Bottom action row |
| `CardAction` | Action slot within header (top-right) |

#### Stat Card Pattern (replaces current raw `div`)

```tsx
<Card className={warning ? "border-warning" : ""}>
  <CardContent className="pt-6">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={cn("text-4xl font-bold mt-1", warning && "text-warning")}>
      {value}
    </p>
  </CardContent>
</Card>
```

### 2.4 Input & Field

**Files:** `components/ui/input.tsx`, `components/ui/field.tsx`

Always pair `Input` with `Field` wrappers in forms for consistent label + error display.

```tsx
<FieldGroup>
  <Field>
    <FieldLabel>Sarlavha</FieldLabel>
    <Input {...register("title")} placeholder="Test nomi..." />
    {errors.title && <FieldError>{errors.title.message}</FieldError>}
  </Field>
</FieldGroup>
```

### 2.5 Table & DataTable

**Files:** `components/ui/table.tsx`, `components/data-table.tsx`

Two table patterns exist — choose based on need:

| Component | Use When |
|---|---|
| `Table` (basic) | Simple read-only lists, no sorting/pagination needed |
| `DataTable` | Sortable columns, client-side pagination, clickable rows |

#### Table Wrapper (required)

Plain `Table` must always be wrapped in this container:

```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>...</TableBody>
  </Table>
</div>
```

#### DataTable

`DataTable` in `components/data-table.tsx` already handles its own wrapper styling. Pass `columns` and `data`:

```tsx
<DataTable columns={columns} data={attempts} />
```

---

## 3. Layout Patterns

### 3.1 Page Shell

Every dashboard page should use this outer structure:

```tsx
<div className="space-y-8">
  {/* Page header */}
  <div>
    <h1 className="text-2xl font-bold">{pageTitle}</h1>
    <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
  </div>

  {/* Content sections follow as direct children */}
  <section>...</section>
  <section>...</section>
</div>
```

**Rules:**
- `space-y-8` at the root — never mix `mb-*` and `space-y-*` on siblings
- H1 is always `text-2xl font-bold`
- Subtitle is always `text-sm text-muted-foreground mt-1`

### 3.2 Stat Cards Grid

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  <Card>
    <CardContent className="pt-6">
      <p className="text-sm text-muted-foreground">Jami testlar</p>
      <p className="text-4xl font-bold mt-1">{stats.totalTests}</p>
    </CardContent>
  </Card>
  {/* ... */}
</div>
```

- Grid: `grid-cols-2` mobile → `sm:grid-cols-4` desktop
- Gap: `gap-4`
- Warning variant: add `border-warning` to Card and `text-warning` to value

### 3.3 Table Wrapper

```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>...</Table>
</div>
```

- Never hardcode `border-zinc-200 dark:border-zinc-800` or `bg-white dark:bg-zinc-900`

### 3.4 Actions Row

For pages with both a page title and a primary action button:

```tsx
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">{title}</h1>
  <Button asChild>
    <Link href="/new"><PlusIcon className="size-4 mr-1" />Yangi test</Link>
  </Button>
</div>
```

For detail pages with multiple sibling actions:

```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">...</Button>
  <Button variant="destructive" size="sm">...</Button>
</div>
```

### 3.5 Empty State

```tsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-sm text-muted-foreground">Hali ma'lumot yo'q.</p>
    <Button className="mt-4" asChild>
      <Link href="/new">Yaratish</Link>
    </Button>
  </div>
) : (
  <DataTable ... />
)}
```

- Text: `text-sm text-muted-foreground` — never `text-gray-500`
- Include a primary CTA when creation is possible

---

## 4. Navigation & Sidebar

**File:** `apps/admin-dashboard/app/dashboard/ui/Sidebar.tsx`

### Navigation Items

| Label | Icon | Route |
|---|---|---|
| Bosh sahifa | `LayoutDashboard` | `/dashboard` |
| Testlar | `ClipboardList` | `/dashboard/tests` |
| O'quvchilar | `Users` | `/dashboard/students` |
| Urinishlar | `BarChart2` | `/dashboard/attempts` |

### Active State

```tsx
// Active link
className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2"

// Inactive link
className="text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg px-3 py-2"
```

> Note: Sidebar nav states use `zinc-*` directly because sidebar has its own token space (`--sidebar-*`). This is intentional — sidebar tokens can be customized independently of page tokens.

### Mobile

- Hidden on desktop via `md:hidden`
- Slides in as overlay drawer on mobile
- 40% black backdrop (`bg-black/40`)
- Close on backdrop click or `X` button

---

## 5. Inconsistency Audit

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

## 6. Dev Task List

**Epic: Design System Consistency**
Tasks must be done in priority order — DS-1 and DS-2 are blockers for all color-related fixes.

| Task ID | Title | Files | Priority | Depends On |
|---|---|---|---|---|
| **DS-1** | Add `--success`, `--error`, `--warning` CSS tokens to globals.css | `app/globals.css` | 🔴 High | — |
| **DS-2** | Update `badge.tsx` success/error/warning variants to use new tokens | `components/ui/badge.tsx` | 🔴 High | DS-1 |
| **DS-3** | Refactor `StatCard` in dashboard page to use `Card` component; remove all hardcoded zinc/white/amber classes | `app/dashboard/page.tsx` | 🔴 High | DS-1 |
| **DS-4** | Replace all `text-gray-500` and `text-zinc-500` with `text-muted-foreground` across all dashboard pages | All pages listed in audit | 🟡 Medium | — |
| **DS-5** | Fix table wrappers — replace hardcoded zinc/white border+bg with `border-border bg-card` | `app/dashboard/page.tsx`, `app/dashboard/students/page.tsx` | 🟡 Medium | — |
| **DS-6** | Replace inline pass/fail spans with Badge component in dashboard recent attempts table | `app/dashboard/page.tsx` | 🟡 Medium | DS-2 |
| **DS-7** | Replace hardcoded role colors with Badge component in students page | `app/dashboard/students/page.tsx` | 🟡 Medium | DS-2 |
| **DS-8** | Add table wrapper div (border-border bg-card) to students page table | `app/dashboard/students/page.tsx` | 🟡 Medium | — |
| **DS-9** | Replace `text-green-600`/`text-red-500` on question option correctness with token classes | `app/dashboard/tests/[id]/page.tsx` | 🟢 Low | DS-1 |
| **DS-10** | Add missing page subtitles (Students, Tests list pages) for visual consistency | `app/dashboard/students/page.tsx`, `app/dashboard/tests/page.tsx` | 🟢 Low | — |

### Acceptance Criteria (per task)

**DS-1:** `globals.css` `:root {}` contains `--success`, `--error`, `--warning` and matching `--*-foreground` variants; `.dark {}` has dark overrides; `@theme inline {}` maps `--color-success` etc.

**DS-2:** All three Badge status variants reference `bg-success/error/warning` and `text-success/error/warning-foreground`. No hardcoded Tailwind palette classes remain in `badge.tsx`.

**DS-3:** `StatCard` component in `dashboard/page.tsx` uses `<Card>` and `<CardContent>`. No inline `bg-white`, `dark:bg-zinc-*`, `border-zinc-*`, `text-zinc-*`, `text-amber-*`. Warning card uses `border-warning` and `text-warning`.

**DS-4:** Grep for `text-gray-500`, `text-zinc-500`, `text-zinc-400` in `app/dashboard/**` returns zero results (excluding sidebar nav which is intentional).

**DS-5:** Grep for `border-zinc-200`, `bg-white dark:bg-zinc-900` inside table wrapper divs returns zero results.

**DS-6:** Recent attempts table in `dashboard/page.tsx` uses `<Badge variant="success">` and `<Badge variant="error">` — no inline `text-green-*` or `text-red-*` spans.

**DS-7:** Students page role column uses `<Badge>` — no inline color classes on role display.

**DS-8:** Students page `<Table>` is wrapped in `<div className="rounded-xl border border-border overflow-hidden bg-card">`.

**DS-9:** Question options in `tests/[id]/page.tsx` use CSS token classes for correct/incorrect styling.

**DS-10:** Students and Tests list pages have a subtitle `<p className="text-sm text-muted-foreground mt-1">` after H1.
