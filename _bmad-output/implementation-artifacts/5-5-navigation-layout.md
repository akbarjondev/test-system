# Story 5.5: Navigation & Layout

Status: ready-for-dev

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

- [ ] Task 1: Find the existing layout file
  - [ ] Glob: `apps/admin-dashboard/app/dashboard/layout.tsx`
  - [ ] Read current layout to understand existing nav structure

- [ ] Task 2: Update or create sidebar navigation
  - [ ] Navigation items:
    - "🏠 Bosh sahifa" → `/dashboard`
    - "📝 Testlar" → `/dashboard/tests`
    - "👥 Foydalanuvchilar" → `/dashboard/users`
  - [ ] Use Next.js `<Link>` component for navigation
  - [ ] Highlight active item using `usePathname()` from `next/navigation`

- [ ] Task 3: Add responsive hamburger menu for mobile
  - [ ] Use shadcn `Sheet` component for mobile navigation drawer
  - [ ] Show hamburger button (☰) on small screens
  - [ ] On click: open Sheet with same nav items
  - [ ] Sheet closes when nav item is clicked

- [ ] Task 4: Ensure layout wraps all dashboard pages
  - [ ] Confirm `apps/admin-dashboard/app/dashboard/layout.tsx` wraps all pages under `/dashboard`
  - [ ] If layout does not exist, create it as a Next.js layout with sidebar

- [ ] Task 5: Add logout button to navigation
  - [ ] Add a "Chiqish" (logout) button at the bottom of the sidebar
  - [ ] Call existing logout action/handler

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

### Completion Notes List

### File List
