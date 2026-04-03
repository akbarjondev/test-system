---
title: Prefer Pure Functions; Isolate Side Effects
impact: MEDIUM
impactDescription: pure functions are trivially testable and predictable; side effects are explicit
tags: code-quality, pure-functions, side-effects, functional, testability
---

## Prefer Pure Functions; Isolate Side Effects

A pure function returns the same output for the same input and has no side effects (no DB writes, no network calls, no mutations of external state). Push side effects to the edges of the system (controllers, repositories) and keep business logic pure.

**Incorrect (business logic mixed with side effects — untestable without mocking everything):**

```typescript
static async computeAndSaveScore(attemptId: string): Promise<number> {
  const answers = await prisma.answer.findMany({ where: { attemptId } });
  let score = 0;
  for (const answer of answers) {
    const option = await prisma.option.findUnique({ where: { id: answer.optionId ?? "" } });
    if (option?.isCorrect) score += 1;
  }
  await prisma.testAttempt.update({ where: { id: attemptId }, data: { score } });
  return score;
}
```

**Correct (pure calculation function + separate side-effect caller):**

```typescript
// Pure — no DB, no I/O, trivially unit-testable
function calculateScore(answers: AnswerWithOption[]): number {
  return answers.reduce((sum, a) => {
    return a.option?.isCorrect ? sum + (a.pointsEarned ?? 0) : sum;
  }, 0);
}

// Side-effect layer — fetches data, calls pure function, persists result
static async submitAttempt(attemptId: string): Promise<number> {
  const answers = await AnswersRepository.findWithOptions(attemptId);
  const score = calculateScore(answers); // pure computation
  await AttemptsRepository.markSubmitted(attemptId, score); // side effect
  return score;
}
```

**Signs a function is impure:** it calls `prisma.*`, `fetch()`, `Date.now()`, `Math.random()`, reads from `process.env`, or mutates a parameter. Move those to the boundary; keep the logic layer pure.

**`Date.now()` / `Math.random()` tip:** inject them as parameters so the pure function stays testable:

```typescript
function buildAttemptRecord(testId: string, studentId: string, now = new Date()): AttemptData {
  return { testId, studentId, startedAt: now };
}
```
