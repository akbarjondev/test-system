"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { formatDateTime } from "@/lib/utils";

export type AttemptRow = {
  id: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  student: { email: string | null; fullName: string | null; phone: string | null };
  test: {
    title: string;
    pointsPerQuestion: number | null;
    questions?: { id: string }[];
  };
};

const columns: ColumnDef<AttemptRow>[] = [
  {
    accessorKey: "test.title",
    header: "Test nomi",
    enableSorting: true,
  },
  {
    id: "student",
    header: "O'quvchi",
    cell: ({ row }) => {
      const s = row.original.student;
      return s.fullName ?? s.email ?? "—";
    },
  },
  {
    id: "phone",
    header: "Telefon",
    cell: ({ row }) => row.original.student.phone ?? "—",
  },
  {
    accessorKey: "startedAt",
    header: "Boshlangan",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-sm text-zinc-500">
        {formatDateTime(row.getValue("startedAt"))}
      </span>
    ),
  },
  {
    accessorKey: "submittedAt",
    header: "Topshirilgan",
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue<string | null>("submittedAt");
      return (
        <span className="text-sm text-zinc-500">
          {val ? formatDateTime(val) : "—"}
        </span>
      );
    },
  },
  {
    id: "score",
    header: "Ball",
    cell: ({ row }) => {
      const attempt = row.original;
      const maxScore =
        (attempt.test.questions?.length ?? 0) *
        (attempt.test.pointsPerQuestion ?? 1);
      if (attempt.score === null) return "—";
      return maxScore > 0 ? `${attempt.score} / ${maxScore}` : attempt.score;
    },
  },
  {
    id: "percent",
    header: "%",
    enableSorting: true,
    sortingFn: (a, b) => {
      const calcPercent = (attempt: AttemptRow) => {
        if (attempt.score === null) return Number.NEGATIVE_INFINITY;
        const max =
          (attempt.test.questions?.length ?? 0) *
          (attempt.test.pointsPerQuestion ?? 1);
        return max > 0 ? (attempt.score / max) * 100 : Number.NEGATIVE_INFINITY;
      };
      return calcPercent(a.original) - calcPercent(b.original);
    },
    cell: ({ row }) => {
      const attempt = row.original;
      const maxScore =
        (attempt.test.questions?.length ?? 0) *
        (attempt.test.pointsPerQuestion ?? 1);
      if (attempt.score === null || maxScore === 0) return "—";
      const percent = Math.round((attempt.score / maxScore) * 100);
      return (
        <span
          className={
            percent >= 60 ? "text-green-600 font-medium" : "text-red-500 font-medium"
          }
        >
          {percent}%
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Holat",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.submittedAt ? (
        <span className="text-green-600 font-medium text-sm">Topshirildi</span>
      ) : (
        <span className="text-yellow-500 font-medium text-sm">Jarayonda</span>
      ),
  },
];

interface AttemptsTableProps {
  attempts: AttemptRow[];
}

export function AttemptsTable({ attempts }: AttemptsTableProps) {
  return <DataTable columns={columns} data={attempts} pageSize={15} />;
}
