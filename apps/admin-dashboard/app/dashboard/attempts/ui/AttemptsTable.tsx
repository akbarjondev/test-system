"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/config/enums";
import { cn, formatDateTime } from "@/lib/utils";
import { SearchIcon } from "lucide-react";

export type AttemptRow = {
  id: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  student: { email: string | null; fullName: string | null; phone: string | null };
  test: {
    id: string;
    title: string;
    passingScore: number | null;
    pointsPerQuestion: number | null;
    questions?: { id: string }[];
  };
};

type StatusFilter = "all" | "in_progress" | "submitted";

function maxScoreForAttempt(attempt: AttemptRow): number {
  return (
    (attempt.test.questions?.length ?? 0) * (attempt.test.pointsPerQuestion ?? 1)
  );
}

function percentForAttempt(attempt: AttemptRow): number | null {
  const max = maxScoreForAttempt(attempt);
  if (attempt.score === null || max === 0) return null;
  return Math.round((attempt.score / max) * 100);
}

function percentBadgeVariant(attempt: AttemptRow): "success" | "error" | "secondary" {
  const thresholdPoints = attempt.test.passingScore;
  if (thresholdPoints == null || attempt.score === null) return "secondary";
  const max = maxScoreForAttempt(attempt);
  if (max <= 0) return "secondary";
  return attempt.score >= thresholdPoints ? "success" : "error";
}

const columns: ColumnDef<AttemptRow>[] = [
  {
    accessorKey: "test.title",
    header: "Test nomi",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate font-medium" title={row.original.test.title}>
        {row.original.test.title}
      </span>
    ),
  },
  {
    id: "student",
    header: "O'quvchi",
    cell: ({ row }) => {
      const s = row.original.student;
      const primary = s.fullName ?? s.email ?? "—";
      const secondary = s.fullName && s.email ? s.email : null;
      return (
        <div className="min-w-0 max-w-[180px]">
          <div className="truncate font-medium">{primary}</div>
          {secondary ? (
            <div className="truncate text-xs text-muted-foreground">{secondary}</div>
          ) : null}
        </div>
      );
    },
  },
  {
    id: "phone",
    header: "Telefon",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {row.original.student.phone ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "startedAt",
    header: "Boshlangan",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
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
        <span className="whitespace-nowrap text-sm text-muted-foreground">
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
      const maxScore = maxScoreForAttempt(attempt);
      if (attempt.score === null) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="tabular-nums text-sm">
          {maxScore > 0 ? (
            <>
              <span className="font-medium">{attempt.score}</span>
              <span className="text-muted-foreground"> / {maxScore}</span>
            </>
          ) : (
            attempt.score
          )}
        </span>
      );
    },
  },
  {
    id: "percent",
    header: "%",
    enableSorting: true,
    sortingFn: (a, b) => {
      const pa = percentForAttempt(a.original);
      const pb = percentForAttempt(b.original);
      const na = pa === null ? Number.NEGATIVE_INFINITY : pa;
      const nb = pb === null ? Number.NEGATIVE_INFINITY : pb;
      return na - nb;
    },
    cell: ({ row }) => {
      const attempt = row.original;
      const percent = percentForAttempt(attempt);
      if (percent === null) return <span className="text-muted-foreground">—</span>;
      return <Badge variant={percentBadgeVariant(attempt)}>{percent}%</Badge>;
    },
  },
  {
    id: "status",
    header: "Holat",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.submittedAt ? (
        <Badge variant="success">Topshirildi</Badge>
      ) : (
        <Badge variant="outline">Jarayonda</Badge>
      ),
  },
];

interface AttemptsTableProps {
  attempts: AttemptRow[];
}

export function AttemptsTable({ attempts }: AttemptsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return attempts.filter((a) => {
      if (statusFilter === "in_progress" && a.submittedAt) return false;
      if (statusFilter === "submitted" && !a.submittedAt) return false;
      if (!q) return true;
      const studentLine = [a.student.fullName, a.student.email, a.student.phone]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const testTitle = a.test.title.toLowerCase();
      return studentLine.includes(q) || testTitle.includes(q);
    });
  }, [attempts, search, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Test yoki o'quvchi bo'yicha qidirish..."
            className="pl-9"
            aria-label="Urinishlarni qidirish"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Holat bo'yicha filtr">
          {(
            [
              ["all", "Hammasi"],
              ["in_progress", "Jarayonda"],
              ["submitted", "Topshirilgan"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={statusFilter === key ? "default" : "outline"}
              className={cn(statusFilter === key && "shadow-sm")}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-12 text-center text-sm text-muted-foreground">
          {attempts.length === 0
            ? "Ma'lumot yo'q."
            : "Qidiruv yoki filtr shartlariga mos urinish topilmadi. Filtrlarni o'zgartirib ko'ring."}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={15}
          onRowClick={(row) => router.push(`${ROUTES.TESTS}/${row.test.id}/results`)}
        />
      )}
    </div>
  );
}
