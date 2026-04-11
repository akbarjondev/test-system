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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ChangeRoleButton } from "./ui/ChangeRoleButton";

type User = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
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
      <h1 className="text-2xl font-bold mb-1">Foydalanuvchilar</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Barcha ro&apos;yxatdan o&apos;tgan foydalanuvchilar</p>

      {users.length === 0 ? (
        <p className="text-muted-foreground">Foydalanuvchilar yo&apos;q.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Ism</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Ro&apos;yxatdan o&apos;tgan sana</TableHead>
                <TableHead>Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.fullName ?? '—'}</TableCell>
                  <TableCell>{user.email ?? '—'}</TableCell>
                  <TableCell>{user.phone ?? '—'}</TableCell>
                  <TableCell>
                    {user.role === "ADMIN" ? (
                      <Badge variant="default">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">O&apos;quvchi</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ChangeRoleButton user={user} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
