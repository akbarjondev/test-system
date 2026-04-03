---
title: Each Function / Class Does Exactly One Thing
impact: MEDIUM
impactDescription: easier to test, debug, and reuse; change in one concern doesn't break another
tags: code-quality, srp, functions, classes, design
---

## Each Function / Class Does Exactly One Thing (SRP)

A function that validates input, transforms data, calls the DB, and sends emails is four functions in a trench coat. When requirements change, you have to understand the entire blob. Split by responsibility.

**Incorrect (one function does validation, business logic, and persistence):**

```typescript
static async createTest(req: Request, res: Response) {
  // validation
  if (!req.body.title || req.body.title.length < 1) {
    return res.status(400).json({ error: "Title required" });
  }
  if (req.body.pointsPerQuestion < 0) {
    return res.status(400).json({ error: "Points must be >= 0" });
  }

  // business logic
  const isScheduled = !req.body.isAlwaysAvailable;
  if (isScheduled && !req.body.availableFrom) {
    return res.status(400).json({ error: "availableFrom required for scheduled tests" });
  }

  // persistence
  const test = await prisma.test.create({
    data: { ...req.body, createdById: req.user.id },
  });

  res.status(201).json(test);
}
```

**Correct (each layer handles one responsibility):**

```typescript
// validate middleware handles validation (already does in this project via Zod)
// service handles business logic
// repository handles persistence

static async createTest(req: Request, res: Response): Promise<void> {
  const test = await TestsService.create(req.body, req.user.id);
  res.status(201).json(test);
}

// service
static async create(data: CreateTestInput, createdById: string): Promise<Test> {
  if (!data.isAlwaysAvailable && !data.availableFrom) {
    throw new ValidationError("availableFrom required for scheduled tests");
  }
  return TestsRepository.create({ ...data, createdById });
}

// repository
static async create(data: TestCreateData): Promise<Test> {
  return prisma.test.create({ data });
}
```

**Smell check:** If you need the word "and" to describe what a function does, split it.
