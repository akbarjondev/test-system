import { API_URL } from "@/config/constants";
import { API_ROUTES, ROUTES } from "@/config/enums";
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
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

type RecentAttempt = {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  testTitle: string;
  score: number | null;
  passingScore: number | null;
  submittedAt: string | null;
  timedOutAt: string | null;
};

type DashboardStats = {
  totalTests: number;
  totalStudents: number;
  totalAttempts: number;
  todayAttempts: number;
  activeTests: number;
  testsWithNoQuestions: number;
  incompleteAttempts: number;
  passRate: number | null;
  recentAttempts: RecentAttempt[];
};

function StatCard({ label, value, warning }: { label: string; value: string | number; warning?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 bg-white dark:bg-zinc-900 ${warning ? "border-amber-400 dark:border-amber-500" : "border-zinc-200 dark:border-zinc-800"}`}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className={`text-4xl font-bold mt-1 ${warning ? "text-amber-500" : ""}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const token = await getAuthOrRedirect();

  const res = await fetch(`${API_URL}${API_ROUTES.STATS}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) redirect(ROUTES.LOGIN);
  if (!res.ok) throw new Error("Statistikani yuklashda xatolik yuz berdi");

  const stats = (await res.json()) as DashboardStats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bosh sahifa</h1>
        <p className="text-sm text-zinc-500 mt-1">Tizim holati haqida umumiy ma&apos;lumot</p>
      </div>

      {/* Tier 1: Core stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Jami testlar" value={stats.totalTests} />
        <StatCard label="Jami o'quvchilar" value={stats.totalStudents} />
        <StatCard label="Jami urinishlar" value={stats.totalAttempts} />
        <StatCard label="Bugun urinishlar" value={stats.todayAttempts} />
      </div>

      {/* Tier 2: Status stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="O'tish darajasi"
          value={stats.passRate !== null ? `${stats.passRate}%` : "—"}
        />
        <StatCard label="Faol testlar" value={stats.activeTests} />
        <StatCard label="Jarayondagi urinishlar" value={stats.incompleteAttempts} />
        <StatCard
          label="Savolsiz testlar"
          value={stats.testsWithNoQuestions}
          warning={stats.testsWithNoQuestions > 0}
        />
      </div>

      {/* Tier 3: Recent attempts */}
      <div>
        <h2 className="text-lg font-semibold mb-3">So&apos;nggi urinishlar</h2>
        {stats.recentAttempts.length === 0 ? (
          <p className="text-sm text-zinc-500">Hali urinishlar yo&apos;q.</p>
        ) : (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>O&apos;quvchi</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Ball</TableHead>
                  <TableHead>Natija</TableHead>
                  <TableHead>Vaqt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentAttempts.map((attempt) => {
                  const passed =
                    attempt.passingScore !== null && attempt.score !== null
                      ? attempt.score >= attempt.passingScore
                      : null;
                  const completedAt = attempt.submittedAt ?? attempt.timedOutAt;

                  return (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">
                        {attempt.studentName ?? attempt.studentEmail ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${ROUTES.ATTEMPTS}`}
                          className="hover:underline"
                        >
                          {attempt.testTitle}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {attempt.score !== null ? attempt.score : "—"}
                      </TableCell>
                      <TableCell>
                        {passed === true && (
                          <span className="text-green-600 text-sm font-medium">O&apos;tdi</span>
                        )}
                        {passed === false && (
                          <span className="text-red-500 text-sm font-medium">O&apos;tmadi</span>
                        )}
                        {passed === null && (
                          <span className="text-zinc-400 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">
                        {completedAt ? formatDateTime(completedAt) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
