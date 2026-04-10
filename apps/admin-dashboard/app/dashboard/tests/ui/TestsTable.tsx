"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Test } from "@test-system/database/prisma/generated/client";
import { DataTable } from "@/components/data-table";
import { ROUTES } from "@/config/enums";
import { formatDate, formatDateTime, formatDuration } from "@/lib/utils";
import { useRouter } from "next/navigation";

type TestWithCount = Test & { _count?: { questions: number }; questions?: { id: string }[] };

const columns: ColumnDef<TestWithCount>[] = [
  {
    accessorKey: "title",
    header: "Nomi",
    enableSorting: true,
  },
  {
    id: "questions_count",
    header: "Savollar soni",
    cell: ({ row }) => {
      const test = row.original;
      if (test._count?.questions !== undefined) return test._count.questions;
      if (test.questions !== undefined) return test.questions.length;
      return "—";
    },
  },
  {
    accessorKey: "timeLimitMinutes",
    header: "Vaqt chegarasi",
    cell: ({ row }) => formatDuration(row.getValue("timeLimitMinutes")),
  },
  {
    accessorKey: "isAlwaysAvailable",
    header: "Holat",
    cell: ({ row }) => {
      const test = row.original;
      if (test.isAlwaysAvailable) return "Har doim";
      const from = test.availableFrom ? formatDateTime(test.availableFrom) : "?";
      const until = test.availableUntil ? formatDateTime(test.availableUntil) : "?";
      return `${from} – ${until}`;
    },
  },
  {
    accessorKey: "passingScore",
    header: "O'tish bali",
    cell: ({ row }) => {
      const score = row.getValue<number | null>("passingScore");
      return score != null ? score : "—";
    },
  },
  {
    accessorKey: "allowOnlyOneAttempt",
    header: "Urinish",
    cell: ({ row }) =>
      row.getValue<boolean>("allowOnlyOneAttempt") ? "1 ta" : "Cheklanmagan",
  },
  {
    accessorKey: "createdAt",
    header: "Yaratilgan",
    cell: ({ row }) => formatDate(row.getValue<string>("createdAt")),
    enableSorting: true,
  },
];

interface TestsTableProps {
  tests: TestWithCount[];
}

export function TestsTable({ tests }: TestsTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={tests}
      pageSize={10}
      onRowClick={(test) => router.push(`${ROUTES.TESTS}/${test.id}`)}
    />
  );
}
