# Story 5.4: Users List Page

Status: review

## Story

As a teacher,
I want to see all registered students in a clear table,
So that I can monitor who is using the platform.

## Acceptance Criteria

1. **Given** a teacher navigates to `/dashboard/users`,
   **When** the page loads,
   **Then** a DataTable shows columns: Ismi, Telefon raqami, Rol, Ro'yxatdan o'tgan sana
   **And** role is shown as a shadcn Badge: "O'qituvchi" (blue) or "Talaba" (gray)
   **And** the table supports sorting and pagination

2. **Given** the teacher searches or filters by name,
   **When** they type in the search input,
   **Then** the table filters results in real time

## Tasks / Subtasks

- [x] Task 1: Find the existing users page
  - [x] Glob: `apps/admin-dashboard/app/dashboard/users/**/*.tsx`
  - [x] Read current users page implementation

- [x] Task 2: Check if `/api/users` endpoint exists and returns user list
  - [x] Grep: `apps/api/src/routes` for `/users` route
  - [x] If exists: confirm it returns `fullName`, `phone`, `role`, `createdAt` fields
  - [x] If `fullName` is null (email-only admin): display `email` as fallback

- [x] Task 3: Replace existing table with shadcn DataTable
  - [x] Define columns:
    - **Ismi**: `user.fullName ?? user.email ?? "Noma'lum"`
    - **Telefon raqami**: `user.phone ?? "-"`
    - **Rol**: Badge — ADMIN → blue "O'qituvchi", STUDENT → gray "Talaba"
    - **Ro'yxatdan o'tgan sana**: formatted `user.createdAt`
  - [x] Enable sorting on Ismi and Ro'yxatdan o'tgan sana
  - [x] Enable pagination (10 per page)

- [x] Task 4: Add real-time search input
  - [x] Add a text input above the DataTable: placeholder "Ism bo'yicha qidirish..."
  - [x] Filter DataTable data in real-time as teacher types (client-side filter on `fullName`/`email`)
  - [x] Use `@tanstack/react-table` `globalFilter` or column `filterFn`

- [x] Task 5: Add empty state
  - [x] If no users: "Hali foydalanuvchilar yo'q."

## Dev Notes

### File Locations — Touch Only These

| File | Change |
|------|--------|
| `apps/admin-dashboard/app/dashboard/users/page.tsx` (or similar) | Replace with DataTable + search |

**Note:** Dev agent must glob and read actual file paths first.

### Role Badge Pattern

```tsx
{
  accessorKey: "role",
  header: "Rol",
  cell: ({ row }) => {
    const role = row.getValue("role") as string;
    return role === "ADMIN"
      ? <Badge className="bg-blue-100 text-blue-800">O'qituvchi</Badge>
      : <Badge variant="outline">Talaba</Badge>;
  },
},
```

### Real-time Search Pattern

```tsx
const [search, setSearch] = useState("");

const filteredUsers = users.filter((u) =>
  (u.fullName ?? u.email ?? "").toLowerCase().includes(search.toLowerCase())
);

// In render:
<input
  type="text"
  placeholder="Ism bo'yicha qidirish..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="mb-4 ..."
/>
<DataTable columns={columns} data={filteredUsers} />
```

### Name Display Priority

After Story 1.1, users have either `fullName` (Telegram students) or `email` (admin). Display priority:
1. `fullName` if set
2. `email` if set
3. "Noma'lum" fallback

### Dependency

Story 5.1 must be merged first — DataTable component must exist.
Story 1.1 must be merged first — `fullName` and `phone` fields must exist on User model.

### References

- Glob: `apps/admin-dashboard/app/dashboard/users/**/*.tsx` — Find users page
- [Source: apps/api/src/routes/] — Verify /api/users endpoint exists

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- No issues encountered during implementation.

### Completion Notes List

- Created new `/dashboard/users` page as a server component that fetches users from `/api/users`.
- Created `UsersTable` client component with shadcn DataTable, real-time search, role Badge, sorting, and pagination.
- Updated `getAllUsers` in the API controller to include `fullName` and `phone` fields in the response.
- No existing `/dashboard/users` page existed — page was created fresh alongside a `/ui/UsersTable.tsx` client component.
- Empty state shows "Hali foydalanuvchilar yo'q." when no users are returned.
- TypeScript strict mode passes with zero errors; lint shows only pre-existing warnings unrelated to this story.
- No test framework is configured in this project — validation performed via TypeScript type checking and lint.

### File List

- apps/admin-dashboard/app/dashboard/users/page.tsx (created)
- apps/admin-dashboard/app/dashboard/users/ui/UsersTable.tsx (created)
- apps/api/src/controllers/users.controller.ts (modified — added fullName and phone to getAllUsers response)

## Change Log

- 2026-04-09: Story 5-4 implemented — created /dashboard/users page with DataTable, real-time search, role badges, sorting, pagination, and empty state. Updated API getAllUsers to return fullName and phone.
