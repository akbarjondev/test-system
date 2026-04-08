---
title: Never Return Raw Prisma Models from Controllers
impact: HIGH
impactDescription: prevents leaking internal fields (password hashes, internal IDs, audit timestamps) to clients
tags: backend, security, prisma, dto, response-shaping
---

## Never Return Raw Prisma Models from Controllers

A Prisma model contains every column in the database row. Returning it directly from a controller leaks internal fields — including sensitive ones like password hashes, soft-delete flags, and internal audit fields — to the client.

Always use a Prisma `select` clause or map to a DTO before sending a response.

**Incorrect (returns all columns including sensitive ones):**

```typescript
export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  res.json(user)  // ❌ Leaks passwordHash, internalRole, deletedAt, etc.
}
```

**Correct (use select to allow-list only safe fields):**

```typescript
export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  })
  res.json(user)
}
```

**Correct (map to DTO in the service layer):**

```typescript
// In UserService:
static async findById(id: string): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  const { passwordHash, ...safeUser } = user
  return safeUser
}
```

**Apply this rule to every controller method** — `GET /users`, `POST /users`, `PATCH /users/:id`. The `select` approach is preferred because it also reduces the data transferred from PostgreSQL.
