import { apiFetch } from "../lib/api";
import type { AttemptQuestion, AttemptResult } from "../types";

interface StartAttemptResponse {
  id: string;
  questions: AttemptQuestion[];
}

export async function startAttempt(testId: string): Promise<StartAttemptResponse> {
  return apiFetch<StartAttemptResponse>(`/api/tests/${testId}/attempts/start`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function submitAnswer(
  attemptId: string,
  questionId: string,
  optionId: string,
): Promise<void> {
  await apiFetch(`/api/attempts/${attemptId}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, optionId }),
  });
}

export async function submitAttempt(attemptId: string): Promise<AttemptResult> {
  try {
    return await apiFetch<AttemptResult>(`/api/attempts/${attemptId}/submit`, {
      method: "POST",
    });
  } catch (err: any) {
    if (err.status === 403 && err.code === "TIME_LIMIT_EXCEEDED") {
      throw Object.assign(err, { timedOut: true });
    }
    throw err;
  }
}
