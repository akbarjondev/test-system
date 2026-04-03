---
title: DRY — Extract Duplication; But Don't Over-Abstract Prematurely
impact: MEDIUM
impactDescription: reduces maintenance burden; one change propagates everywhere; avoids wrong abstractions
tags: code-quality, dry, abstraction, duplication, yagni
---

## DRY — Extract Duplication; But Don't Over-Abstract Prematurely

DRY (Don't Repeat Yourself) means every piece of knowledge has a single, authoritative representation. But premature abstraction — pulling out a helper for two lines that happen to look similar — often creates the wrong abstraction and makes code harder to change later.

**Incorrect (duplicated error-handling pattern in every action):**

```typescript
// actions/tests.ts
export const createTest = async (data) => {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/tests`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.error) return { error: json.error };
    redirect(`/dashboard/tests/${json.id}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
};

// actions/questions.ts — exact same try/catch/fetch boilerplate
export const createQuestion = async (data) => {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/questions`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.error) return { error: json.error };
    redirect(`/dashboard/questions/${json.id}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed" };
  }
};
```

**Correct (shared fetch helper — the duplicated *knowledge* is extracted):**

```typescript
// lib/api-client.ts
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const json = await res.json();
    if (json.error) return { error: json.error };
    return { data: json as T };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unexpected error" };
  }
}

// actions/tests.ts — now focused on intent
export const createTest = async (data: CreateTestInput) => {
  const { data: test, error } = await apiRequest<Test>("/api/tests", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (error) return { error };
  redirect(`/dashboard/tests/${test!.id}`);
};
```

**The "Rule of Three":** Don't extract until you have the pattern in three places. Two occurrences might be coincidence. Three is a pattern worth naming.

**Warning signs of over-abstraction:**
- The abstraction needs more parameters than the original code had lines
- You can't name it without using "OrElse", "Maybe", "Handler", "Manager", or "Util"
- Callers always pass the same arguments — the abstraction isn't actually varying
