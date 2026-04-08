import { API_ROUTES, ROUTES } from "@/config/enums";
import { PaginatedResponse } from "@test-system/types";
import { Test } from "@test-system/database/prisma/generated/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EyeIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { formatDuration } from "@/lib/utils";
import { API_URL } from "@/config/constants";
import { Button } from "@/components/ui/button";

export default async function TestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page: string; limit: string }>;
}) {
  const { page, limit } = await searchParams;
  const pageNumber = page ? parseInt(page) : 1;
  const limitNumber = limit ? parseInt(limit) : 20;
  const token = await getAuthOrRedirect();

  const tests = await fetch(
    `${API_URL}${API_ROUTES.TESTS}?page=${pageNumber}&limit=${limitNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (tests.status === 401 || tests.status === 403) redirect(ROUTES.LOGIN);
  if (!tests.ok) throw new Error("Testlarni yuklashda xatolik yuz berdi");
  const testsData = (await tests.json()) as unknown as PaginatedResponse<Test>;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Testlar</h1>
        <Button asChild>
          <Link href={ROUTES.TESTS_NEW}>
            <PlusIcon className="size-4 inline-flex" />
            Test qo'shish
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nomi</TableHead>
            <TableHead>Vaqt limiti</TableHead>
            <TableHead>Izoh</TableHead>
            <TableHead>Yaratilgan vaqt</TableHead>
            <TableHead>Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testsData.data.map((test) => (
            <TableRow key={test.id}>
              <TableCell>{test.title}</TableCell>
              <TableCell>{formatDuration(test.timeLimitMinutes)}</TableCell>
              <TableCell>{test.description}</TableCell>
              <TableCell>
                {dayjs(test.createdAt).format("DD.MM.YYYY HH:mm")}
              </TableCell>
              <TableCell>
                <Link
                  className="text-blue-500 hover:text-blue-700 inline-flex"
                  href={`${ROUTES.TESTS}/${test.id}`}
                >
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination className="mt-4">
        <PaginationContent>
          {testsData.pagination.totalPages > 1 && (
            <>
              {testsData.pagination.hasPrev && (
                <PaginationItem>
                  <PaginationPrevious
                    href={`${ROUTES.TESTS}?page=${testsData.pagination.page - 1}&limit=${limitNumber}`}
                  />
                </PaginationItem>
              )}
            </>
          )}
          {testsData.pagination.totalPages > 1 && (
            <>
              {testsData.pagination.hasNext && (
                <PaginationItem>
                  <PaginationNext
                    href={`${ROUTES.TESTS}?page=${testsData.pagination.page + 1}&limit=${limitNumber}`}
                  />
                </PaginationItem>
              )}
            </>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
