# Adding a New Dashboard Server Action

```typescript
// apps/admin-dashboard/actions/widgets.ts
"use server";

import { API_URL } from "@/config/constants";
import { API_ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const createWidget = async (data: {
  name: string;
  value: number;
}): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.WIDGETS}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (responseData.error) {
      return { error: responseData.error };
    }

    redirect(`/dashboard/widgets/${responseData.id}`);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create widget" };
  }
};

export const deleteWidget = async (widgetId: string): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.WIDGETS}/${widgetId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return { error: data.error ?? "Failed to delete widget" };
    }

    revalidatePath("/dashboard/widgets");
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete widget" };
  }

  redirect("/dashboard/widgets");
};
```

**Rules:**
- Always add `"use server"` at the top
- Return `{ error?: string }` — never throw from a server action
- Use `redirect()` for navigation after mutation
- Use `revalidatePath()` after mutations that affect list pages

---
