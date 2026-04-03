---
title: Keep Functions Small and Focused (~25 Lines Max)
impact: MEDIUM
impactDescription: easier to read, test, and modify without understanding the whole
tags: code-quality, functions, size, readability, complexity
---

## Keep Functions Small and Focused (~25 Lines Max)

A function that fits on one screen is easier to reason about than one that requires scrolling. ~25 lines is a guideline, not a law — but if you're hitting 40+ lines, something almost always wants to be extracted.

**Incorrect (one large function that does too much):**

```typescript
static async startTest(req: Request, res: Response) {
  // find test
  const test = await prisma.test.findUnique({
    where: { id: req.params.testId },
    include: { questions: { include: { options: true } } },
  });
  if (!test) return res.status(404).json({ error: "Test not found" });

  // availability check
  if (!test.isAlwaysAvailable) {
    const now = new Date();
    if (test.availableFrom && now < test.availableFrom) {
      return res.status(403).json({ error: "Test not yet available" });
    }
    if (test.availableUntil && now > test.availableUntil) {
      return res.status(403).json({ error: "Test no longer available" });
    }
  }

  // check for existing active attempt
  const existing = await prisma.testAttempt.findFirst({
    where: { testId: test.id, studentId: req.user.id, submittedAt: null },
  });
  if (existing) return res.status(409).json({ error: "Active attempt already exists" });

  // shuffle questions
  const shuffled = [...test.questions].sort(() => Math.random() - 0.5);

  // create attempt + question orders in transaction
  const attempt = await prisma.$transaction(async (tx) => {
    const a = await tx.testAttempt.create({
      data: { testId: test.id, studentId: req.user.id },
    });
    await Promise.all(
      shuffled.map((q, i) =>
        tx.questionOrder.create({
          data: { attemptId: a.id, questionId: q.id, displayOrder: i },
        })
      )
    );
    return a;
  });

  res.status(201).json({ attemptId: attempt.id, questions: shuffled });
}
```

**Correct (extracted helpers — each function fits in one screen):**

```typescript
static async startTest(req: Request, res: Response): Promise<void> {
  const test = await TestsRepository.findWithQuestions(req.params.testId);
  if (!test) { res.status(404).json({ error: "Test not found" }); return; }

  const availabilityError = checkTestAvailability(test);
  if (availabilityError) { res.status(403).json({ error: availabilityError }); return; }

  const existing = await AttemptsRepository.findActive(test.id, req.user.id);
  if (existing) { res.status(409).json({ error: "Active attempt already exists" }); return; }

  const attempt = await AttemptsService.createWithShuffledQuestions(test, req.user.id);
  res.status(201).json(attempt);
}

function checkTestAvailability(test: TestWithDates): string | null {
  if (test.isAlwaysAvailable) return null;
  const now = new Date();
  if (test.availableFrom && now < test.availableFrom) return "Test not yet available";
  if (test.availableUntil && now > test.availableUntil) return "Test no longer available";
  return null;
}
```

**Signs a function needs splitting:**
- Needs a comment block to explain each "section"
- Has more than one level of nesting beyond the happy path
- Does both I/O and computation
- You can't name it without using "and"
