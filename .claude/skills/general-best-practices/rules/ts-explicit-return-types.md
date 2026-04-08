---
title: Annotate Function Return Types Explicitly
impact: HIGH
impactDescription: prevents accidental return type widening and makes interfaces self-documenting
tags: typescript, types, return-types, readability
---

## Annotate Function Return Types Explicitly

TypeScript can infer return types, but relying on inference for exported functions and class methods hides intent, makes signatures harder to read, and allows accidental type widening when the implementation changes.

**Incorrect (return type inferred — changes silently if body changes):**

```typescript
export async function getTestById(testId: string) {
  return prisma.test.findUnique({ where: { id: testId } });
  // inferred: Promise<Test | null>
}

export class TestsController {
  static async createTest(req: Request, res: Response) {
    // return type inferred from body — easy to break silently
  }
}
```

**Correct (return type declared — acts as a compile-time contract):**

```typescript
export async function getTestById(testId: string): Promise<Test | null> {
  return prisma.test.findUnique({ where: { id: testId } });
}

export class TestsController {
  static async createTest(req: Request, res: Response): Promise<void> {
    const test = await TestsService.create(req.body);
    res.status(201).json(test);
  }
}
```

**Where this matters most:**
- Public/exported functions and class methods
- Repository methods (they define the data-access contract)
- Server actions in `apps/admin-dashboard/actions/`

**Where inference is fine:**
- Small private helpers where the type is obvious from context
- Single-expression arrow functions inline in array methods
