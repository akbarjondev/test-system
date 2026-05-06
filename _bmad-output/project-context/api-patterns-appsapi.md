# API Patterns (`apps/api`)

### Import Convention
```typescript
// CORRECT — uses baseUrl "." so src/ is the root:
import { TestsService } from "src/services/tests.service";
import { UserRole } from "src/types/enums";
// NOT relative paths like ../../services/...
```

### Middleware Chain (order matters)
```
helmet → cors → express.json → rateLimit → router
  → validate(zodSchema)       [body routes only, before auth]
  → verifyTokenMiddleware     [JWT check, attaches req.user]
  → verifyAdminMiddleware     [admin-only routes only]
  → Controller
```

### Controller Pattern
```typescript
export class FooController {
  static async doThing(req: Request<{fooId: string}, any, BodyType>, res: Response) {
    try {
      const result = await FooService.doThing(...);
      return res.status(201).json(result);
    } catch (error: any) {
      // Map known error messages to HTTP codes:
      if (error.message === "Not found") return res.status(404).json({ error: error.message });
      if (error.message.includes("Unauthorized")) return res.status(403).json({ error: error.message });
      return res.status(500).json({ error: "Failed to ..." });
    }
  }
}
```

### Service Pattern
- Business logic + authorization checks live in Services
- Services throw `new Error("message")` with specific strings (controllers map these to HTTP codes)
- Authorization pattern: check ownership OR admin role
  ```typescript
  if (resource.createdById !== userId && userRole !== UserRole.ADMIN) {
    throw new Error("Unauthorized: You can only ...");
  }
  ```

### Repository Pattern
- Only Prisma queries here — no business logic
- Always import `prisma` from `@test-system/database/lib/prisma`
- Always import Prisma types from `@test-system/database/prisma/generated/client`
- Use `includeRelations: boolean` flag pattern for optional eager loading

### Route Registration Pattern
```typescript
// Route file: apps/api/src/routes/foo.ts
const router = express.Router();
router.use(verifyTokenMiddleware); // apply to all
router.post("/", validate(createFooSchema), FooController.createFoo);
router.get("/:fooId", FooController.getFoo);
// Register in server.ts:
app.use("/api/foos", fooRoutes);
```

### Adding a New Zod Schema
Always add to `apps/api/src/config/schemas.ts`:
```typescript
export const createFooSchema = z.object({ ... });
export const updateFooSchema = createFooSchema.partial();
```

### req.user Type
`req.user` is typed as `Omit<User, "password">` via `apps/api/src/types/express.d.ts`. Contains: `id`, `email`, `role`, `createdAt`.

### UserRole Enum
Defined locally in `apps/api/src/types/enums.ts`:
```typescript
// Use: UserRole.ADMIN, UserRole.STUDENT
```
Not imported from `@test-system/types` in the API — use the local enum.

---
