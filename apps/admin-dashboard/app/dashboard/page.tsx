import { API_URL } from "@/config/constants";
import { API_ROUTES, ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import dayjs from "dayjs";

type Test = {
  id: string;
  title: string;
  createdAt: string;
  timeLimitMinutes: number;
  isAlwaysAvailable: boolean;
};

type PaginatedTests = {
  data: Test[];
  pagination: { total: number };
};

type User = { id: string };

export default async function DashboardPage() {
  const token = await getToken();

  const [testsRes, usersRes, recentRes] = await Promise.all([
    fetch(`${API_URL}${API_ROUTES.TESTS}?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${API_URL}${API_ROUTES.TESTS}?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);

  const testsData = (await testsRes.json()) as PaginatedTests;
  const usersData = (await usersRes.json()) as User[];
  const recentData = (await recentRes.json()) as PaginatedTests;

  const totalTests = testsData.pagination?.total ?? 0;
  const totalStudents = Array.isArray(usersData) ? usersData.length : 0;
  const recentTests = recentData.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Bosh sahifa</h1>
        <p className="text-sm text-zinc-500 mt-1">Tizim holati haqida umumiy ma&apos;lumot</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Jami testlar</p>
          <p className="text-4xl font-bold mt-1">{totalTests}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Jami o&apos;quvchilar</p>
          <p className="text-4xl font-bold mt-1">{totalStudents}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">So&apos;nggi testlar</h2>
        {recentTests.length === 0 ? (
          <p className="text-sm text-zinc-500">Hali testlar yaratilmagan.</p>
        ) : (
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Vaqt limiti</TableHead>
                  <TableHead>Mavjudlik</TableHead>
                  <TableHead>Yaratilgan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <Link
                        href={`${ROUTES.TESTS}/${test.id}`}
                        className="font-medium hover:underline"
                      >
                        {test.title}
                      </Link>
                    </TableCell>
                    <TableCell>{test.timeLimitMinutes} daqiqa</TableCell>
                    <TableCell>
                      {test.isAlwaysAvailable ? (
                        <span className="text-green-600 text-sm font-medium">Har doim</span>
                      ) : (
                        <span className="text-zinc-500 text-sm">Cheklangan</span>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">
                      {dayjs(test.createdAt).format("DD.MM.YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
