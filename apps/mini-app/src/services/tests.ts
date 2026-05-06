import { apiFetch } from "../lib/api";
import type { TestItem } from "../types";

export async function getTests(): Promise<TestItem[]> {
  return apiFetch<TestItem[]>("/api/tests");
}

export async function unlockTest(testPassword: string): Promise<TestItem> {
  return apiFetch<TestItem>("/api/tests/unlock", {
    method: "POST",
    body: JSON.stringify({ testPassword }),
  });
}
