"use server";

import { API_URL } from "@/config/constants";
import { API_ROUTES, ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { z } from "zod";

const createTestSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  pointsPerQuestion: z.number().min(1),
  timeLimitMinutes: z.number().min(1),
  isAlwaysAvailable: z.boolean(),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
});

export const createTest = async (
  data: z.infer<typeof createTestSchema>,
): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}${API_ROUTES.TESTS}`, {
      method: "POST",
      body: JSON.stringify({
        ...data,
        availableFrom: data.availableFrom?.toISOString() ?? null,
        availableUntil: data.availableUntil?.toISOString() ?? null,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const responseData = await response.json();

    if (responseData.error) {
      return { error: responseData.error };
    }

    redirect(`${ROUTES.TESTS}/${responseData.id}`);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create test" };
  }
};
