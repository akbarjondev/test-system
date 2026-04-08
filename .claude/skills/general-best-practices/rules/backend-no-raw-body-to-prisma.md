---
title: Never Pass req.body Directly to Prisma
impact: CRITICAL
impactDescription: prevents mass-assignment vulnerabilities and prototype pollution via unvalidated input
tags: backend, security, prisma, validation, zod
---

## Never Pass req.body Directly to Prisma

The Zod `validate(schema)` middleware validates the request body and attaches the result to `req.body`. Always use the validated/typed data — never spread or forward `req.body` directly into a Prisma call, even after validation middleware has run.

**Incorrect (spreads raw body into Prisma — mass-assignment risk):**

```typescript
// Even if validate() ran, spreading req.body allows extra fields through
// if the Zod schema uses .passthrough() or is misconfigured.
export async function createTest(req: Request, res: Response): Promise<void> {
  const test = await prisma.test.create({
    data: { ...req.body }  // ❌ Never do this
  })
  res.json(test)
}
```

**Correct (destructure only the fields you expect):**

```typescript
export async function createTest(req: Request, res: Response): Promise<void> {
  const { title, description, duration, passingScore } = req.body as CreateTestBody
  const test = await TestService.create({ title, description, duration, passingScore })
  res.json(test)
}
```

**Why this matters:** Zod schemas in this project use `.strip()` by default (unknown keys are removed), but explicit destructuring makes it clear exactly which fields reach the database and prevents accidental leakage if a schema is later changed to `.passthrough()`.
