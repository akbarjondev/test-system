"use server";

import { API_URL } from "@/config/constants";
import { API_ROUTES, ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const testSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  pointsPerQuestion: z.number().min(1),
  timeLimitMinutes: z.number().min(1),
  isAlwaysAvailable: z.boolean(),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  testPassword: z.string().max(3).optional().nullable(),
  allowOnlyOneAttempt: z.boolean().optional(),
  passingScore: z.number().min(0).optional().nullable(),
});

export const createTest = async (
  data: z.infer<typeof testSchema>,
): Promise<{ error?: string; redirectTo?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.TESTS}`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        availableFrom: data.availableFrom?.toISOString() ?? null,
        availableUntil: data.availableUntil?.toISOString() ?? null,
        testPassword: data.testPassword ?? null,
        allowOnlyOneAttempt: data.allowOnlyOneAttempt ?? false,
        passingScore: data.passingScore ?? null,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: string };
      return { error: err.error ?? "Test yaratishda xatolik yuz berdi" };
    }
    const responseData = await response.json();
    return { redirectTo: `${ROUTES.TESTS}/${responseData.id}` };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Test yaratishda xatolik yuz berdi" };
  }
};

export const updateTest = async (
  testId: string,
  data: z.infer<typeof testSchema>,
): Promise<{ error?: string; redirectTo?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.TESTS}/${testId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...data,
        availableFrom: data.availableFrom?.toISOString() ?? null,
        availableUntil: data.availableUntil?.toISOString() ?? null,
        testPassword: data.testPassword ?? null,
        allowOnlyOneAttempt: data.allowOnlyOneAttempt ?? false,
        passingScore: data.passingScore ?? null,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { error?: string };
      return { error: err.error ?? "Testni saqlashda xatolik yuz berdi" };
    }

    revalidatePath(`${ROUTES.TESTS}/${testId}`);
    return { redirectTo: `${ROUTES.TESTS}/${testId}` };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Testni saqlashda xatolik yuz berdi" };
  }
};

export const deleteTest = async (testId: string): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.TESTS}/${testId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return { error: data.error ?? "Failed to delete test" };
    }

    revalidatePath(ROUTES.TESTS);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete test" };
  }

  redirect(ROUTES.TESTS);
};
