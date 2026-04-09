# Story 5.4: Users List Page

Status: ready-for-dev

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

- [ ] Task 1: Find the existing users page
  - [ ] Glob: `apps/admin-dashboard/app/dashboard/users/**/*.tsx`
  - [ ] Read current users page implementation

- [ ] Task 2: Check if `/api/users` endpoint exists and returns user list
  - [ ] Grep: `apps/api/src/routes` for `/users` route
  - [ ] If exists: confirm it returns `fullName`, `phone`, `role`, `createdAt` fields
  - [ ] If `fullName` is null (email-only admin): display `email` as fallback

- [ ] Task 3: Replace existing table with shadcn DataTable
  - [ ] Define columns:
    - **Ismi**: `user.fullName ?? user.email ?? "Noma'lum"`
    - **Telefon raqami**: `user.phone ?? "-"`
    - **Rol**: Badge — ADMIN → blue "O'qituvchi", STUDENT → gray "Talaba"
    - **Ro'yxatdan o'tgan sana**: formatted `user.createdAt`
  - [ ] Enable sorting on Ismi and Ro'yxatdan o'tgan sana
  - [ ] Enable pagination (10 per page)

- [ ] Task 4: Add real-time search input
  - [ ] Add a text input above the DataTable: placeholder "Ism bo'yicha qidirish..."
  - [ ] Filter DataTable data in real-time as teacher types (client-side filter on `fullName`/`email`)
  - [ ] Use `@tanstack/react-table` `globalFilter` or column `filterFn`

- [ ] Task 5: Add empty state
  - [ ] If no users: "Hali foydalanuvchilar yo'q."

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

### Completion Notes List

### File List
