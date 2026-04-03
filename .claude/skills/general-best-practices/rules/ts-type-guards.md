---
title: Narrow Types with Guards Instead of Casting
impact: HIGH
impactDescription: prevents runtime crashes from incorrect type assumptions
tags: typescript, types, type-guards, narrowing, casting
---

## Narrow Types with Guards Instead of Casting

`as SomeType` is a lie to the compiler — it doesn't validate anything at runtime. Type guards (runtime checks that TypeScript understands) provide both safety and narrowing.

**Incorrect (casting silently ignores actual shape):**

```typescript
function handleError(error: unknown) {
  const err = error as Error;
  console.log(err.message); // crashes if error is a string or object
}

const user = req.user as { id: string; role: string };
// crashes if verifyToken returned something unexpected
```

**Correct (narrow first, use after):**

```typescript
function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message; // TypeScript knows it's Error here
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

// Custom type guard for domain types
function isUser(value: unknown): value is { id: string; role: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === "string" &&
    typeof (value as Record<string, unknown>).role === "string"
  );
}

if (isUser(req.user)) {
  console.log(req.user.id); // narrowed safely
}
```

**Preferred in this project — use Zod for external data:**

```typescript
import { z } from "zod";

// Parse and narrow in one step — throws with a clear error if invalid
const body = submitAnswerSchema.parse(req.body);
// body is now typed as { questionId: string; optionId?: string | null }
```

**`as` is acceptable only when:**
- Casting a more general type to a known subtype you've already verified manually
- Working with DOM APIs (`document.getElementById("x") as HTMLInputElement`)
- Always add a comment explaining why the cast is safe
