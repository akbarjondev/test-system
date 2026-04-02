# Coding Conventions

Copy-paste-ready patterns for common tasks. Follow these exactly to stay consistent.

---

## Adding a New API Route

### 1. Define the Zod schema in `apps/api/src/config/schemas.ts`

```typescript
// apps/api/src/config/schemas.ts
export const createWidgetSchema = z.object({
  name: z.string().min(1),
  value: z.number().min(0),
});

export const updateWidgetSchema = createWidgetSchema.partial();
```

> **Never** define schemas inline in route files. All schemas live in `config/schemas.ts`.

### 2. Create the route file `apps/api/src/routes/widgets.ts`

```typescript
import express from "express";
import { WidgetsController } from "src/controllers/widgets.controller";
import { verifyTokenMiddleware } from "src/middlewares/auth";
import { validate } from "src/middlewares/validate";
import { createWidgetSchema, updateWidgetSchema } from "src/config/schemas";

const router = express.Router();
router.use(verifyTokenMiddleware);

router.get("/", WidgetsController.getAll);
router.get("/:widgetId", WidgetsController.getById);
router.post("/", validate(createWidgetSchema), WidgetsController.create);
router.put("/:widgetId", validate(updateWidgetSchema), WidgetsController.update);
router.delete("/:widgetId", WidgetsController.delete);

export default router;
```

For admin-only routes, add `verifyAdminMiddleware` after `verifyTokenMiddleware`:
```typescript
router.use(verifyTokenMiddleware);
router.use(verifyAdminMiddleware);
```

### 3. Mount the router in `apps/api/src/server.ts`

```typescript
import widgetsRoutes from "./routes/widgets";
// ...
app.use("/api/widgets", widgetsRoutes);
```

### 4. Implement Controller → Service → Repository

```typescript
// apps/api/src/controllers/widgets.controller.ts
import { Request, Response } from "express";
import { WidgetsService } from "src/services/widgets.service";

export class WidgetsController {
  static async getAll(req: Request, res: Response) {
    try {
      const widgets = await WidgetsService.getAll();
      res.json(widgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch widgets" });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const widget = await WidgetsService.create(req.body);
      res.status(201).json(widget);
    } catch (error) {
      res.status(500).json({ error: "Failed to create widget" });
    }
  }
}
```

```typescript
// apps/api/src/services/widgets.service.ts
import { WidgetsRepository } from "src/repositories/widgets.repository";

export class WidgetsService {
  static async getAll() {
    return WidgetsRepository.findAll();
  }

  static async create(data: { name: string; value: number }) {
    return WidgetsRepository.create(data);
  }
}
```

```typescript
// apps/api/src/repositories/widgets.repository.ts
import { prisma } from "@test-system/database/generated/client";

export class WidgetsRepository {
  static async findAll() {
    return prisma.widget.findMany();
  }

  static async create(data: { name: string; value: number }) {
    return prisma.widget.create({ data });
  }
}
```

---

## Adding a New Dashboard Server Action

```typescript
// apps/admin-dashboard/actions/widgets.ts
"use server";

import { API_URL } from "@/config/constants";
import { API_ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createWidget = async (data: {
  name: string;
  value: number;
}): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.WIDGETS}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (responseData.error) {
      return { error: responseData.error };
    }

    redirect(`/dashboard/widgets/${responseData.id}`);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create widget" };
  }
};

export const deleteWidget = async (widgetId: string): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.WIDGETS}/${widgetId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return { error: data.error ?? "Failed to delete widget" };
    }

    revalidatePath("/dashboard/widgets");
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete widget" };
  }

  redirect("/dashboard/widgets");
};
```

**Rules:**
- Always add `"use server"` at the top
- Return `{ error?: string }` — never throw from a server action
- Use `redirect()` for navigation after mutation
- Use `revalidatePath()` after mutations that affect list pages

---

## Adding a New Prisma Model

### 1. Edit `packages/database/prisma/schema.prisma`

```prisma
model Widget {
  id        String   @id @default(cuid())
  name      String
  value     Float
  createdAt DateTime @default(now())

  @@map("widgets")
}
```

### 2. Run migration

```bash
cd packages/database && npm run db:migrate
# Prisma will prompt for a migration name, e.g. "add_widgets_table"
```

### 3. Regenerate the client (if not auto-regenerated by migrate)

```bash
cd packages/database && npm run db:generate
```

> Never use `db:push` for production-tracked changes — always `db:migrate` to create a versioned migration file.

---

## Error Response Format

All API errors must use this shape:

```typescript
// Simple error
res.status(404).json({ error: "Test not found" });

// With code (for programmatic handling)
res.status(429).json({ error: "Too many requests", code: "TOO_MANY_REQUESTS" });

// Validation error (produced by validate middleware automatically)
res.status(400).json({
  error: "Validation failed",
  details: [{ field: "email", message: "Invalid email" }]
});
```

Never return raw error objects or stack traces to the client.

---

## Zod Schema Registration Rules

1. **Always** add new schemas to `apps/api/src/config/schemas.ts`
2. Name pattern: `create<Entity>Schema`, `update<Entity>Schema` (update = `.partial()` of create)
3. Import in route file: `import { createWidgetSchema } from "src/config/schemas"`
4. Apply with middleware: `validate(createWidgetSchema)` before the controller handler

```typescript
// CORRECT
export const createWidgetSchema = z.object({ name: z.string().min(1) });

// WRONG — never inline in route file
router.post("/", validate(z.object({ name: z.string() })), handler);
```

---

## File Naming

| Thing                  | Convention    | Example                        |
|------------------------|---------------|--------------------------------|
| Route files            | camelCase     | `users.ts`, `testAttempts.ts`  |
| Controller files       | camelCase     | `users.controller.ts`          |
| Service files          | camelCase     | `users.service.ts`             |
| Repository files       | camelCase     | `users.repository.ts`          |
| React components       | PascalCase    | `FormTest.tsx`, `TestCard.tsx` |
| Next.js pages          | lowercase     | `page.tsx`, `layout.tsx`       |
| Server action files    | camelCase     | `tests.ts`, `questions.ts`     |
| Config files           | camelCase     | `schemas.ts`, `constants.ts`   |

---

## TypeScript Path Aliases

The API uses `tsconfig-paths` with a `src` alias:

```typescript
// CORRECT — use src-relative path
import { UsersService } from "src/services/users.service";

// WRONG — don't use relative paths with ../../..
import { UsersService } from "../../services/users.service";
```

The dashboard uses `@` aliased to the app root:
```typescript
import { API_URL } from "@/config/constants";
```
