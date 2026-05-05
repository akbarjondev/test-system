import WebApp from "@twa-dev/sdk";
import { apiFetch } from "../lib/api";

export interface AuthResult {
  token: string;
  user: {
    id: string;
    fullName: string;
    telegramId: string;
  };
}

export async function authenticate(): Promise<AuthResult> {
  const initData = WebApp.initData;

  if (!initData) {
    throw new Error("Could not read Telegram initData");
  }

  const response = await apiFetch<AuthResult>("/api/auth/telegram-miniapp", {
    method: "POST",
    body: JSON.stringify({ initData }),
  });

  sessionStorage.setItem("token", response.token);
  return response;
}
