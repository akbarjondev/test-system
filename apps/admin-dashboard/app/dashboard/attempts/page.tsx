import { API_URL } from "@/config/constants";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/enums";
import { AttemptsTable, type AttemptRow } from "./ui/AttemptsTable";

type PaginatedAttempts = {
  data: AttemptRow[];
  pagination: { total: number };
};

export default async function AttemptsPage() {
  const token = await getAuthOrRedirect();

  const res = await fetch(`${API_URL}/api/attempts?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) redirect(ROUTES.LOGIN);
  if (!res.ok) throw new Error("Natijalarni yuklashda xatolik yuz berdi");

  const result = (await res.json()) as PaginatedAttempts;
  const attempts = result.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Natijalar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Barcha testlar bo&apos;yicha urinishlar — jami:{" "}
          {result.pagination?.total ?? 0}
        </p>
      </div>

      {result.pagination?.total > attempts.length && (
        <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
          Jami {result.pagination.total} ta urinishdan {attempts.length} tasi ko&apos;rsatilmoqda. Qolganlarini ko&apos;rish uchun server tomonlama sahifalash kerak.
        </p>
      )}

      {attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Hali hech qanday urinish mavjud emas.
        </p>
      ) : (
        <AttemptsTable attempts={attempts} />
      )}
    </div>
  );
}
