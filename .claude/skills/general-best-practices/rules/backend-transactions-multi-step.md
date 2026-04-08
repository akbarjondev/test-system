---
title: Use prisma.$transaction() for Multi-Step Writes
impact: CRITICAL
impactDescription: prevents partial writes that leave the database in an inconsistent state
tags: backend, prisma, transactions, data-integrity, reliability
---

## Use prisma.$transaction() for Multi-Step Writes

Any operation that writes to more than one table — or performs a read-then-write — must be wrapped in `prisma.$transaction()`. Without a transaction, a failure halfway through leaves the database in an inconsistent state that is difficult to detect and recover from.

**Incorrect (two writes without a transaction — partial failure leaves orphaned data):**

```typescript
export async function submitAttempt(attemptId: string, score: number): Promise<void> {
  // If the second write fails, the attempt is marked submitted but score is never saved
  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: { submittedAt: new Date() }
  })
  await prisma.testAttempt.update({
    where: { id: attemptId },
    data: { score }
  })
}
```

**Correct (both writes are atomic):**

```typescript
export async function submitAttempt(attemptId: string, score: number): Promise<void> {
  await prisma.$transaction([
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: { submittedAt: new Date() }
    }),
    prisma.testAttempt.update({
      where: { id: attemptId },
      data: { score }
    })
  ])
}
```

**Interactive transaction (when you need results from earlier steps):**

```typescript
export async function createTestWithQuestions(
  testData: CreateTestData,
  questions: CreateQuestionData[]
): Promise<Test> {
  return prisma.$transaction(async (tx) => {
    const test = await tx.test.create({ data: testData })
    await tx.question.createMany({
      data: questions.map((q) => ({ ...q, testId: test.id }))
    })
    return test
  })
}
```

**Rule of thumb:** if your service method has two or more `await prisma.*` write calls, they belong in a transaction.
