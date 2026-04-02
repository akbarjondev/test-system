"use server";

import { API_URL } from "@/config/constants";
import { API_ROUTES, ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { questionFormSchema } from "@/definitions/questions";

export const createQuestion = async (
  testId: string,
  data: z.infer<typeof questionFormSchema>,
) => {
  try {
    const token = await getToken();
    const response = await fetch(
      `${API_URL}${API_ROUTES.TESTS}/${testId}/questions`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseData = await response.json();

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create question" };
  }
};

export const updateQuestion = async (
  questionId: string,
  testId: string,
  data: z.infer<typeof questionFormSchema>,
): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: "PUT",
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

    redirect(`${ROUTES.TESTS}/${testId}`);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to update question" };
  }
};

export const deleteQuestion = async (
  questionId: string,
  testId: string,
): Promise<{ error?: string }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${API_URL}/api/questions/${questionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 204) {
      const data = await response.json();
      return { error: data.error ?? "Failed to delete question" };
    }

    revalidatePath(`${ROUTES.TESTS}/${testId}`);
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete question" };
  }

  redirect(`${ROUTES.TESTS}/${testId}`);
};
