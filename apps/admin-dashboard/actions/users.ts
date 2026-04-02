"use server";

import { API_URL } from "@/config/constants";
import { getToken } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/config/enums";

export const updateUserRole = async (
  userId: string,
  role: "ADMIN" | "STUDENT",
): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.error) return { error: data.error };

    revalidatePath(ROUTES.STUDENTS);
    return {};
  } catch (error) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Failed to update role" };
  }
};
