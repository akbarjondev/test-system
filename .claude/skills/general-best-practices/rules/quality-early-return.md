---
title: Guard Clauses Instead of Deep Nesting
impact: MEDIUM
impactDescription: reduces cognitive load; happy path is obvious at a glance
tags: code-quality, early-return, guard-clauses, nesting, readability
---

## Guard Clauses Instead of Deep Nesting

Deep `if/else` nesting buries the happy path. Guard clauses handle edge cases early and let the main logic flow at the top level.

**Incorrect (happy path buried inside nesting):**

```typescript
static async submitAnswer(req: Request, res: Response) {
  const attempt = await AttemptsRepository.findById(req.params.attemptId);
  if (attempt) {
    if (!attempt.submittedAt) {
      const question = await QuestionsRepository.findById(req.body.questionId);
      if (question) {
        if (question.testId === attempt.testId) {
          const answer = await AnswersRepository.upsert({
            attemptId: attempt.id,
            questionId: question.id,
            optionId: req.body.optionId ?? null,
          });
          res.json(answer);
        } else {
          res.status(400).json({ error: "Question not in this test" });
        }
      } else {
        res.status(404).json({ error: "Question not found" });
      }
    } else {
      res.status(409).json({ error: "Attempt already submitted" });
    }
  } else {
    res.status(404).json({ error: "Attempt not found" });
  }
}
```

**Correct (guard clauses — errors handled first, happy path linear):**

```typescript
static async submitAnswer(req: Request, res: Response): Promise<void> {
  const attempt = await AttemptsRepository.findById(req.params.attemptId);
  if (!attempt) {
    res.status(404).json({ error: "Attempt not found" });
    return;
  }

  if (attempt.submittedAt) {
    res.status(409).json({ error: "Attempt already submitted" });
    return;
  }

  const question = await QuestionsRepository.findById(req.body.questionId);
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  if (question.testId !== attempt.testId) {
    res.status(400).json({ error: "Question not in this test" });
    return;
  }

  const answer = await AnswersRepository.upsert({
    attemptId: attempt.id,
    questionId: question.id,
    optionId: req.body.optionId ?? null,
  });

  res.json(answer);
}
```

**Rule:** If nesting exceeds 2 levels, refactor to guard clauses or extract helper functions.
