---
title: Names Describe What, Not How
impact: MEDIUM
impactDescription: code becomes self-documenting; reduces need for comments
tags: code-quality, naming, readability, variables, functions
---

## Names Describe What, Not How

Good names describe the *intent* and *domain meaning* of a value or action, not the implementation detail of how it works.

**Incorrect (names describe implementation):**

```typescript
const arr = await prisma.test.findMany();          // arr — what's in it?
const flag = attempt.submittedAt !== null;         // flag — what does it mean?
const temp = score / questions.length;             // temp — what is this value?

function doThings(id: string) { /* ... */ }        // doThings — does what?
function processData(data: unknown) { /* ... */ }  // processData — processes how?
function handleClick() { /* ... */ }               // ok in UI, vague in services
```

**Correct (names describe domain meaning):**

```typescript
const tests = await prisma.test.findMany();
const isSubmitted = attempt.submittedAt !== null;
const averageScore = score / questions.length;

function deleteTestAndCascade(testId: string) { /* ... */ }
function parseAttemptResults(raw: unknown): AttemptResult { /* ... */ }
function handleSubmitButtonClick() { /* ... */ }
```

**Naming conventions for this project:**

| Thing | Pattern | Example |
|---|---|---|
| Boolean variable | `is`, `has`, `can`, `should` prefix | `isAlwaysAvailable`, `hasSubmitted` |
| Async function | verb + noun | `getTestById`, `createAttempt` |
| Event handler | `handle` + event | `handleFormSubmit`, `handleDelete` |
| Predicate function | `is`, `has`, `can` prefix | `isTestAvailable(test)` |
| Collection | plural noun | `tests`, `questions`, `attempts` |
| Single item | singular noun | `test`, `question`, `attempt` |
| Count | `count` or `total` suffix | `questionCount`, `totalScore` |

**Avoid:**
- Abbreviations unless universal (`id`, `url`, `api`, `db` are fine; `q`, `t`, `res2` are not)
- Generic names: `data`, `result`, `value`, `item`, `obj`, `info` (except at system boundaries)
- Commented-out code pretending to be a name: `// the thing we computed above`
