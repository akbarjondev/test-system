---
title: Mark Object Parameters `readonly` When Not Mutated
impact: MEDIUM
impactDescription: prevents accidental mutation of caller data; documents intent
tags: typescript, types, readonly, immutability, parameters
---

## Mark Object Parameters `readonly` When Not Mutated

When a function receives an object and doesn't intend to mutate it, marking the parameter (or its fields) as `readonly` documents intent and lets TypeScript catch accidental mutations.

**Incorrect (function signature doesn't express mutability intent):**

```typescript
function formatTest(test: Test): string {
  test.title = test.title.trim(); // mutation! caller's object is modified
  return `${test.title} (${test.timeLimitMinutes} min)`;
}

function computeScore(answers: Answer[]): number {
  answers.sort((a, b) => a.pointsEarned - b.pointsEarned); // sorts in place — surprise!
  return answers.reduce((sum, a) => sum + a.pointsEarned, 0);
}
```

**Correct (readonly signals and enforces no mutation):**

```typescript
function formatTest(test: Readonly<Test>): string {
  const title = test.title.trim(); // must create new value, not mutate
  return `${title} (${test.timeLimitMinutes} min)`;
}

function computeScore(answers: ReadonlyArray<Answer>): number {
  // answers.sort() would now be a compile error
  return answers.reduce((sum, a) => sum + a.pointsEarned, 0);
}
```

**In service/repository layer:**

```typescript
// Repository create methods: the input data shouldn't be mutated
async function createTest(data: Readonly<CreateTestInput>): Promise<Test> {
  return prisma.test.create({ data });
}
```

**Rule of thumb:** If a function doesn't need to mutate an object parameter, add `Readonly<T>` or `ReadonlyArray<T>`. If you're sorting or modifying, make a copy first: `[...answers].sort(...)`.
