---
title: Use `unknown` Instead of `any`
impact: HIGH
impactDescription: catches type errors at compile time instead of runtime
tags: typescript, types, safety, any, unknown
---

## Use `unknown` Instead of `any`

`any` disables all type checking on a value — it is a complete escape hatch. `unknown` is the type-safe alternative: it forces you to narrow the type before using it, catching errors at compile time.

**Incorrect (any turns off the type checker):**

```typescript
function parseResponse(data: any) {
  return data.user.email.toLowerCase(); // no error even if data is null
}

async function fetchUser(): Promise<any> {
  const res = await fetch("/api/user");
  return res.json();
}
```

**Correct (unknown forces explicit narrowing):**

```typescript
function parseResponse(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "user" in data &&
    typeof (data as { user: unknown }).user === "object"
  ) {
    const user = (data as { user: { email: string } }).user;
    return user.email.toLowerCase();
  }
  throw new Error("Unexpected response shape");
}

// Or use Zod to parse and narrow at once (preferred in this project)
import { z } from "zod";
const userSchema = z.object({ email: z.string() });

function parseResponse(data: unknown): string {
  const { email } = userSchema.parse(data);
  return email.toLowerCase();
}
```

**Exception:** `any` is acceptable when consuming third-party libraries that don't ship types, or when bridging untyped legacy code — always comment why.

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyResult = thirdPartyLib.doThing() as any; // TODO: upstream has no types
```
