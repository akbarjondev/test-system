---
title: Use Discriminated Unions for Variant Shapes
impact: HIGH
impactDescription: eliminates null checks and invalid state combinations; exhaustive pattern matching
tags: typescript, types, discriminated-unions, variants, pattern-matching
---

## Use Discriminated Unions for Variant Shapes

When a value can be one of several distinct shapes (e.g., success vs. error, different states), use a discriminated union instead of optional fields. TypeScript can then narrow exhaustively.

**Incorrect (optional fields allow invalid combinations):**

```typescript
type ApiResult = {
  data?: Test;
  error?: string;
  loading?: boolean;
};

// These are all valid but some make no sense:
const r1: ApiResult = { data: test, error: "oops" }; // both data and error?
const r2: ApiResult = {};                              // none of them?

function handleResult(r: ApiResult) {
  if (r.data) {
    // r.error might still be set — ambiguous
  }
}
```

**Correct (discriminated union — each state is unambiguous):**

```typescript
type ApiResult<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

function handleResult(r: ApiResult<Test>) {
  switch (r.status) {
    case "loading":
      return "Loading...";
    case "success":
      return r.data.title; // TypeScript knows data exists here
    case "error":
      return r.error;      // TypeScript knows error exists here
  }
  // TypeScript warns if a case is unhandled (exhaustiveness)
}
```

**In server actions (already used in this project):**

```typescript
// The { error?: string } pattern is a simple two-variant discriminated union
export async function createTest(data: CreateTestInput): Promise<{ error?: string }> {
  // success: returns {}
  // failure: returns { error: "message" }
}

// Callers check:
const result = await createTest(data);
if (result.error) { /* handle */ }
```

**For richer state, use explicit `status` or `type` fields — not optional booleans.**
