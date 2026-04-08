# General Best Practices — Full Reference

15 rules across 3 categories. Each rule has an incorrect example, a correct example, and context.

---

## Category 1: TypeScript Correctness (HIGH impact)

---

### ts-no-any — Use `unknown` Instead of `any`

`any` disables all type checking. `unknown` forces you to narrow before using, catching errors at compile time.

**Incorrect:**
```typescript
function parseResponse(data: any) {
  return data.user.email.toLowerCase(); // no error even if data is null
}
```

**Correct:**
```typescript
// Use Zod to parse and narrow at once (preferred in this project)
import { z } from "zod";
const userSchema = z.object({ email: z.string() });

function parseResponse(data: unknown): string {
  const { email } = userSchema.parse(data);
  return email.toLowerCase();
}
```

Exception: third-party libraries without types — always add a comment explaining why.

---

### ts-explicit-return-types — Annotate Function Return Types Explicitly

Inference hides intent and allows silent type widening. Explicit return types act as compile-time contracts.

**Incorrect:**
```typescript
export async function getTestById(testId: string) {
  return prisma.test.findUnique({ where: { id: testId } });
}
```

**Correct:**
```typescript
export async function getTestById(testId: string): Promise<Test | null> {
  return prisma.test.findUnique({ where: { id: testId } });
}
```

Applies to: exported functions, class methods, repository methods, server actions.

---

### ts-type-guards — Narrow Types with Guards Instead of Casting

`as SomeType` is a lie to the compiler — no runtime validation. Type guards provide both safety and narrowing.

**Incorrect:**
```typescript
function handleError(error: unknown) {
  const err = error as Error;
  console.log(err.message); // crashes if error is a string
}
```

**Correct:**
```typescript
function handleError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

// For external data, Zod parses and narrows in one step
const body = submitAnswerSchema.parse(req.body);
```

---

### ts-readonly-params — Mark Object Parameters `readonly` When Not Mutated

Documents intent, prevents accidental mutation of caller data.

**Incorrect:**
```typescript
function computeScore(answers: Answer[]): number {
  answers.sort(...); // sorts caller's array in place — surprise!
  return answers.reduce((sum, a) => sum + a.pointsEarned, 0);
}
```

**Correct:**
```typescript
function computeScore(answers: ReadonlyArray<Answer>): number {
  // answers.sort() is now a compile error
  return answers.reduce((sum, a) => sum + a.pointsEarned, 0);
}

// If you need to sort, copy first
const sorted = [...answers].sort(...);
```

---

### ts-discriminated-unions — Use Discriminated Unions for Variant Shapes

Optional fields allow impossible combinations. Discriminated unions make each state unambiguous and TypeScript narrows exhaustively.

**Incorrect:**
```typescript
type ApiResult = {
  data?: Test;
  error?: string;
  loading?: boolean; // can have data AND error at same time
};
```

**Correct:**
```typescript
type ApiResult<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function handle(r: ApiResult<Test>) {
  switch (r.status) {
    case "success": return r.data.title; // narrowed
    case "error":   return r.error;      // narrowed
    case "loading": return "...";
  }
}
```

The `{ error?: string }` server action pattern is a simple two-variant form of this — already used throughout the project.

---

## Category 2: Code Quality (MEDIUM impact)

---

### quality-single-responsibility — Each Function/Class Does Exactly One Thing

If you need "and" to describe what a function does, split it.

**Incorrect:**
```typescript
static async createTest(req, res) {
  // validates input AND applies business rules AND persists — all in one
}
```

**Correct:**
```typescript
// validate middleware handles validation (Zod schema)
// service handles business logic
// repository handles persistence

static async createTest(req: Request, res: Response): Promise<void> {
  const test = await TestsService.create(req.body, req.user.id);
  res.status(201).json(test);
}
```

Smell check: if you need a comment block labelled "// step 1 — validate", "// step 2 — transform", extract those steps into named functions.

---

### quality-early-return — Guard Clauses Instead of Deep Nesting

Handle edge cases first. Let the happy path flow linearly at the top level.

**Incorrect:**
```typescript
if (attempt) {
  if (!attempt.submittedAt) {
    if (question) {
      // happy path buried at level 3
    } else { res.status(404)... }
  } else { res.status(409)... }
} else { res.status(404)... }
```

**Correct:**
```typescript
if (!attempt) { res.status(404).json({ error: "Attempt not found" }); return; }
if (attempt.submittedAt) { res.status(409).json({ error: "Already submitted" }); return; }
if (!question) { res.status(404).json({ error: "Question not found" }); return; }

// happy path — linear, obvious
const answer = await AnswersRepository.upsert(...);
res.json(answer);
```

Rule: nesting beyond 2 levels → refactor to guard clauses or extract helpers.

---

### quality-pure-functions — Prefer Pure Functions; Isolate Side Effects

Keep business logic pure (same input → same output, no side effects). Push I/O to the edges.

**Incorrect:**
```typescript
// business logic tangled with DB calls — untestable without full Prisma mock
static async computeAndSaveScore(attemptId: string) {
  const answers = await prisma.answer.findMany(...);
  let score = 0;
  // ... compute ...
  await prisma.testAttempt.update(...);
}
```

**Correct:**
```typescript
// Pure — no I/O, trivially unit-testable
function calculateScore(answers: AnswerWithOption[]): number {
  return answers.reduce((sum, a) => a.option?.isCorrect ? sum + a.pointsEarned : sum, 0);
}

// Side-effect boundary — fetches, calls pure fn, persists
static async submitAttempt(attemptId: string): Promise<number> {
  const answers = await AnswersRepository.findWithOptions(attemptId);
  const score = calculateScore(answers);
  await AttemptsRepository.markSubmitted(attemptId, score);
  return score;
}
```

Inject non-deterministic inputs (`Date.now()`, `Math.random()`) as parameters so the function remains pure and testable.

---

### quality-naming — Names Describe What, Not How

Names should reflect domain meaning, not implementation details.

**Incorrect:** `arr`, `flag`, `temp`, `doThings()`, `processData()`, `handleClick()`

**Correct:** `tests`, `isSubmitted`, `averageScore`, `deleteTestAndCascade()`, `parseAttemptResults()`

| Pattern | Use | Example |
|---|---|---|
| Boolean | `is/has/can/should` prefix | `isAlwaysAvailable`, `hasSubmitted` |
| Async fn | verb + noun | `getTestById`, `createAttempt` |
| Event handler | `handle` + event | `handleFormSubmit` |
| Collection | plural noun | `tests`, `questions` |
| Count | `count`/`total` suffix | `questionCount`, `totalScore` |

Avoid: abbreviations (except `id`, `url`, `api`, `db`), generic names (`data`, `result`, `value`, `item`).

---

### quality-no-magic-numbers — Named Constants Over Magic Numbers

**Incorrect:**
```typescript
if (password.length < 6) { ... }
rateLimit({ windowMs: 60000, max: 100 });
```

**Correct:**
```typescript
const MIN_PASSWORD_LENGTH = 6;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 100;

if (password.length < MIN_PASSWORD_LENGTH) { ... }
rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX_REQUESTS });
```

HTTP status codes (`404`, `201`, `409`) are universally known — fine as literals. Anything else that carries domain meaning: name it.

Use the `Role` enum for role comparisons — already done in this project.

---

### quality-small-functions — Keep Functions Under ~25 Lines

**Signs a function needs splitting:**
- Needs comment blocks to label each "section"
- Does both I/O and computation
- More than 2 levels of nesting
- Can't name it without "and"

**Pattern:** extract `checkTestAvailability()`, `buildAttemptRecord()`, etc. from large controller/service methods. Each extracted function gets a clear name that documents intent.

---

### quality-dry — Extract Duplication; Don't Over-Abstract Prematurely

**Rule of Three:** don't extract until the pattern appears in three places. Two occurrences might be coincidence.

**What to extract:** duplicated fetch boilerplate, repeated error-handling patterns, shared validation logic.

**What NOT to extract:** two functions that happen to look similar but represent different concepts. Wrong abstraction is worse than duplication.

**Warning signs of over-abstraction:**
- The helper needs more parameters than the original code had lines
- You can't name it without "Handler", "Manager", "Util", or "OrElse"
- Every caller passes the same arguments (the abstraction isn't varying)
