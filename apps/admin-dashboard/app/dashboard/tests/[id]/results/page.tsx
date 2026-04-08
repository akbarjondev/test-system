import { API_ROUTES, ROUTES } from "@/config/enums";
import { API_URL } from "@/config/constants";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { TestWithRelations } from "@test-system/types";

type Attempt = {
  id: string;
  testId: string;
  studentId: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  student: { id: string; email: string };
};

export default async function TestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAuthOrRedirect();

  const [testRes, attemptsRes] = await Promise.all([
    fetch(`${API_URL}${API_ROUTES.TESTS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
    fetch(`${API_URL}/api/tests/${id}/attempts`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);

  if (testRes.status === 401 || testRes.status === 403) redirect(ROUTES.LOGIN);
  if (!testRes.ok) throw new Error("Test ma'lumotlarini yuklashda xatolik yuz berdi");
  if (attemptsRes.status === 401 || attemptsRes.status === 403) redirect(ROUTES.LOGIN);
  if (!attemptsRes.ok) throw new Error("Natijalarni yuklashda xatolik yuz berdi");

  const test = (await testRes.json()) as TestWithRelations;
  const attempts = (await attemptsRes.json()) as Attempt[];

  const submitted = attempts.filter((a) => a.submittedAt !== null);
  const inProgress = attempts.filter((a) => a.submittedAt === null);

  const maxScore = (test.questions?.length ?? 0) * (test.pointsPerQuestion ?? 1);

  return (
    <section>
      <h1 className="text-2xl font-bold mb-1">{test.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Jami urinishlar: {attempts.length} | Yakunlangan: {submitted.length} |
        Jarayonda: {inProgress.length}
      </p>

      {submitted.length === 0 ? (
        <p className="text-gray-500">Hali hech kim testni topshirmagan.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>O&apos;quvchi</TableHead>
              <TableHead>Boshlangan vaqt</TableHead>
              <TableHead>Topshirilgan vaqt</TableHead>
              <TableHead>Ball</TableHead>
              {maxScore > 0 && <TableHead>Foiz</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {submitted.map((attempt, index) => {
              const percent =
                maxScore > 0 && attempt.score !== null
                  ? Math.round((attempt.score / maxScore) * 100)
                  : null;
              return (
                <TableRow key={attempt.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{attempt.student.email}</TableCell>
                  <TableCell>
                    {dayjs(attempt.startedAt).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    {dayjs(attempt.submittedAt).format("DD.MM.YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    {attempt.score ?? 0}
                    {maxScore > 0 ? ` / ${maxScore}` : ""}
                  </TableCell>
                  {maxScore > 0 && (
                    <TableCell>
                      <span
                        className={
                          percent !== null && percent >= 60
                            ? "text-green-600 font-medium"
                            : "text-red-500 font-medium"
                        }
                      >
                        {percent !== null ? `${percent}%` : "—"}
                      </span>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {inProgress.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">
            Jarayonda ({inProgress.length})
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>O&apos;quvchi</TableHead>
                <TableHead>Boshlangan vaqt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inProgress.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.student.email}</TableCell>
                  <TableCell>
                    {dayjs(attempt.startedAt).format("DD.MM.YYYY HH:mm")}
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
