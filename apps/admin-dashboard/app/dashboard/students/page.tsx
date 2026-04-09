import { API_URL } from "@/config/constants";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { ChangeRoleButton } from "./ui/ChangeRoleButton";

type User = {
  id: string;
  email: string | null;
  role: "ADMIN" | "STUDENT";
  createdAt: string;
};

export default async function StudentsPage() {
  const token = await getAuthOrRedirect();

  const res = await fetch(`${API_URL}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) redirect(ROUTES.LOGIN);
  if (!res.ok) throw new Error("Foydalanuvchilarni yuklashda xatolik yuz berdi");
  const users = (await res.json()) as User[];

  return (
    <section>
      <h1 className="text-2xl font-bold mb-6">Foydalanuvchilar</h1>

      {users.length === 0 ? (
        <p className="text-gray-500">Foydalanuvchilar yo&apos;q.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Ro&apos;yxatdan o&apos;tgan sana</TableHead>
              <TableHead>Amалlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{user.email ?? ''}</TableCell>
                <TableCell>
                  <span
                    className={
                      user.role === "ADMIN"
                        ? "text-blue-600 font-medium"
                        : "text-gray-600"
                    }
                  >
                    {user.role === "ADMIN" ? "Admin" : "O'quvchi"}
                  </span>
                </TableCell>
                <TableCell>
                  {dayjs(user.createdAt).format("DD.MM.YYYY")}
                </TableCell>
                <TableCell>
                  <ChangeRoleButton user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
