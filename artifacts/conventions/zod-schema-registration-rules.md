# Zod Schema Registration Rules

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
