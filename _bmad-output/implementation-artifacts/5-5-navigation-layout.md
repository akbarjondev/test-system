# Story 5.5: Navigation & Layout

Status: review

## Story

As a teacher,
I want a simple navigation structure where any page is reachable in 2 clicks,
So that I never feel lost in the dashboard.

## Acceptance Criteria

1. **Given** a teacher is logged in,
   **When** they view any dashboard page,
   **Then** a sidebar or top navigation shows links: Bosh sahifa, Testlar, Foydalanuvchilar — all in Uzbek
   **And** the active page is visually highlighted

2. **Given** a teacher is on any page,
   **When** they click any nav item,
   **Then** they reach their destination in one click (maximum 2 clicks from any screen)

3. **Given** the dashboard is viewed on a smaller screen,
   **When** the viewport is mobile-sized,
   **Then** the navigation collapses into a hamburger menu and all pages remain accessible

## Tasks / Subtasks

- [x] Task 1: Find the existing layout file
  - [x] Glob: `apps/admin-dashboard/app/dashboard/layout.tsx`
  - [x] Read current layout to understand existing nav structure

- [x] Task 2: Update or create sidebar navigation
  - [x] Navigation items:
    - "🏠 Bosh sahifa" → `/dashboard`
    - "📝 Testlar" → `/dashboard/tests`
    - "👥 Foydalanuvchilar" → `/dashboard/students`
  - [x] Use Next.js `<Link>` component for navigation
  - [x] Highlight active item using `usePathname()` from `next/navigation`

- [x] Task 3: Add responsive hamburger menu for mobile
  - [x] Use hamburger button (Menu icon) on small screens via `md:hidden`
  - [x] Show hamburger button (☰) on small screens
  - [x] On click: open slide-out drawer with same nav items
  - [x] Sheet closes when nav item is clicked

- [x] Task 4: Ensure layout wraps all dashboard pages
  - [x] Confirm `apps/admin-dashboard/app/dashboard/layout.tsx` wraps all pages under `/dashboard`
  - [x] Layout exists and is correctly structured with Sidebar

- [x] Task 5: Add logout button to navigation
  - [x] "Chiqish" (logout) button at bottom of sidebar (desktop and mobile drawer)
  - [x] Calls existing `logout` action from `@/actions/auth`

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/app/dashboard/layout.tsx` | Add/update sidebar nav with Uzbek labels and active highlighting |

**Note:** Dev agent must read actual layout file first to understand current structure.

### Active Link Pattern

```tsx
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "🏠 Bosh sahifa" },
  { href: "/dashboard/tests", label: "📝 Testlar" },
  { href: "/dashboard/users", label: "👥 Foydalanuvchilar" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium",
            pathname === item.href || pathname.startsWith(item.href + "/")
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

### Mobile Sheet Pattern

```tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// In header:
<Sheet>
  <SheetTrigger className="md:hidden">☰</SheetTrigger>
  <SheetContent side="left">
    <Sidebar />
  </SheetContent>
</Sheet>
```

### cn utility

```ts
import { cn } from "@/lib/utils"; // Standard Next.js + shadcn pattern
```

### References

- [Source: apps/admin-dashboard/app/dashboard/layout.tsx] — Current layout structure
- shadcn components: Sheet, Button, Link

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `@radix-ui/react-dialog` (required by shadcn Sheet) was not installed. Implemented mobile hamburger menu using React state + Tailwind CSS overlay pattern instead — achieves identical UX without new dependencies.
- Story spec listed `/dashboard/users` for "Foydalanuvchilar" but no such route exists in the codebase. Mapped to `/dashboard/students` (the existing users/students page) to avoid broken navigation.

### Completion Notes List

- Task 1: Layout at `apps/admin-dashboard/app/dashboard/layout.tsx` already existed and referenced a `Sidebar` component from `./ui/Sidebar`.
- Task 2: Updated `Sidebar.tsx` — changed "O'quvchilar" label to "Foydalanuvchilar" (Uzbek for "Users"); all nav items in Uzbek with icons; active highlighting via `usePathname()` with exact/prefix matching; all items use Next.js `<Link>`.
- Task 3: Added mobile responsive hamburger menu — `md:hidden` fixed top bar with Menu icon button opens a slide-out drawer overlay; drawer has backdrop click to dismiss, X close button, and auto-closes when a nav link is clicked.
- Task 4: Layout confirmed to wrap all `/dashboard/**` pages via Next.js nested layout. Updated `main` padding to `pt-20 md:pt-6` to accommodate fixed mobile top bar.
- Task 5: "Chiqish" logout button exists in both desktop sidebar and mobile drawer, calls `logout()` from `@/actions/auth`.

### File List

- `apps/admin-dashboard/app/dashboard/ui/Sidebar.tsx` — Updated: added mobile hamburger menu, responsive behavior, renamed "O'quvchilar" → "Foydalanuvchilar"
- `apps/admin-dashboard/app/dashboard/layout.tsx` — Updated: added `pt-20 md:pt-6` to main for mobile top bar offset

## Change Log

- 2026-04-09: Implemented Story 5.5 — Navigation & Layout. Updated Sidebar with "Foydalanuvchilar" label, added responsive mobile hamburger drawer using React state + Tailwind overlay pattern, updated layout padding for mobile top bar.
