import { API_URL } from "@/config/constants";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/enums";
import { UsersTable } from "./ui/UsersTable";

export type User = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: "ADMIN" | "STUDENT";
  createdAt: string;
};

export default async function UsersPage() {
  const token = await getAuthOrRedirect();

  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) redirect(ROUTES.LOGIN);
  if (!res.ok) throw new Error("Foydalanuvchilarni yuklashda xatolik yuz berdi");
  const users = (await res.json()) as User[];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Foydalanuvchilar</h1>
      <UsersTable users={users} />
    </div>
  );
}
