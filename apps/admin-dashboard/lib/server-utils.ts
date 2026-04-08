import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/enums";

export const getToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
};

export const getAuthOrRedirect = async (): Promise<string> => {
  const token = await getToken();
  if (!token) redirect(ROUTES.LOGIN);
  return token;
};