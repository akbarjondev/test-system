# 4. Navigation & Sidebar

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
