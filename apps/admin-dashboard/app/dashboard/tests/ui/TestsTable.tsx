"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Test } from "@test-system/database/prisma/generated/client";
import { DataTable } from "@/components/data-table";
import { ROUTES } from "@/config/enums";
import { formatDate, formatDateTime, formatDuration } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

type TestWithCount = Test & { _count?: { questions: number }; questions?: { id: string }[] };

const columns: ColumnDef<TestWithCount>[] = [
  {
    accessorKey: "title",
    header: "Nomi",
    enableSorting: true,
    cell: ({ row }) => {
      const title = row.getValue<string>("title");
      return (
        <span className="block max-w-[min(100%,18rem)] truncate font-medium" title={title}>
          {title}
        </span>
      );
    },
  },
  {
    id: "questions_count",
    header: "Savollar",
    cell: ({ row }) => {
      const test = row.original;
      const n =
        test._count?.questions !== undefined
          ? test._count.questions
          : test.questions !== undefined
            ? test.questions.length
            : null;
      if (n === null) return <span className="text-muted-foreground">—</span>;
      if (n === 0) {
        return (
          <Badge variant="warning" className="tabular-nums">
            0 ta
          </Badge>
        );
      }
      return <span className="tabular-nums text-muted-foreground">{n}</span>;
    },
  },
  {
    accessorKey: "timeLimitMinutes",
    header: "Vaqt chegarasi",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatDuration(row.getValue("timeLimitMinutes"))}
      </span>
    ),
  },
  {
    accessorKey: "isAlwaysAvailable",
    header: "Mavjudligi",
    cell: ({ row }) => {
      const test = row.original;
      if (test.isAlwaysAvailable) {
        return <Badge variant="success">Har doim ochiq</Badge>;
      }
      const from = test.availableFrom ? formatDateTime(test.availableFrom) : "?";
      const until = test.availableUntil ? formatDateTime(test.availableUntil) : "?";
      return (
        <span className="max-w-[14rem] text-xs leading-snug text-muted-foreground" title={`${from} – ${until}`}>
          {from} – {until}
        </span>
      );
    },
  },
  {
    accessorKey: "passingScore",
    header: "O'tish bali",
    cell: ({ row }) => {
      const score = row.getValue<number | null>("passingScore");
      return score != null ? <span className="tabular-nums">{score}</span> : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: "allowOnlyOneAttempt",
    header: "Urinish",
    cell: ({ row }) =>
      row.getValue<boolean>("allowOnlyOneAttempt") ? (
        <Badge variant="secondary">1 marta</Badge>
      ) : (
        <Badge variant="outline">Cheklanmagan</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Yaratilgan",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">{formatDate(row.getValue<string>("createdAt"))}</span>
    ),
    enableSorting: true,
  },
];

interface TestsTableProps {
  tests: TestWithCount[];
}

export function TestsTable({ tests }: TestsTableProps) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={tests}
        pageSize={10}
        onRowClick={(test) => router.push(`${ROUTES.TESTS}/${test.id}`)}
        searchPlaceholder="Test nomi bo'yicha qidirish…"
        searchAccessor="title"
      />
      <p className="text-xs text-muted-foreground">
        Qatorni bosib test sahifasini oching — savollar, sozlamalar va natijalar shu yerda.
      </p>
    </div>
  );
}
