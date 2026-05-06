# Adding a New API Route

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
