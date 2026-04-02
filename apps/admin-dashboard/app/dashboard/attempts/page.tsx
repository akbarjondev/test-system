import { API_URL } from "@/config/constants";
import { getToken } from "@/lib/server-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";

type Attempt = {
  id: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  student: { email: string };
  test: {
    title: string;
    pointsPerQuestion: number | null;
    questions: { id: string }[];
  };
};

type PaginatedAttempts = {
  data: Attempt[];
  pagination: { total: number };
};

export default async function AttemptsPage() {
  const token = await getToken();

  const res = await fetch(`${API_URL}/api/attempts?limit=50`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const result = (await res.json()) as PaginatedAttempts;
  const attempts = result.data ?? [];
  const submitted = attempts.filter((a) => a.submittedAt !== null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Natijalar</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Barcha testlar bo&apos;yicha urinishlar — jami: {result.pagination?.total ?? 0}
        </p>
      </div>

      {submitted.length === 0 ? (
        <p className="text-sm text-zinc-500">Hali hech kim testni topshirmagan.</p>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Test nomi</TableHead>
                <TableHead>O&apos;quvchi</TableHead>
                <TableHead>Boshlangan</TableHead>
                <TableHead>Topshirilgan</TableHead>
                <TableHead>Ball</TableHead>
                <TableHead>%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submitted.map((attempt, index) => {
                const maxScore =
                  (attempt.test.questions?.length ?? 0) *
                  (attempt.test.pointsPerQuestion ?? 1);
                const percent =
                  maxScore > 0 && attempt.score !== null
                    ? Math.round((attempt.score / maxScore) * 100)
                    : null;
                return (
                  <TableRow key={attempt.id}>
                    <TableCell className="text-zinc-500">{index + 1}</TableCell>
                    <TableCell className="font-medium">{attempt.test.title}</TableCell>
                    <TableCell>{attempt.student.email}</TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {dayjs(attempt.startedAt).format("DD.MM.YYYY HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {attempt.submittedAt
                        ? dayjs(attempt.submittedAt).format("DD.MM.YYYY HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {attempt.score ?? 0}
                      {maxScore > 0 ? ` / ${maxScore}` : ""}
                    </TableCell>
                    <TableCell>
                      {percent !== null ? (
                        <span
                          className={
                            percent >= 60
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {percent}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
