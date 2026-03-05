"use server";

import { API_URL } from "@/config/constants";
import { API_ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
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
      return {
        error: error.message,
      };
    }
    return {
      error: "Failed to create question",
    };
  }
};
