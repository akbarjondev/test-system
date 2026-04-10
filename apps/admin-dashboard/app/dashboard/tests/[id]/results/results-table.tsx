"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { intervalToDuration } from "date-fns";
import { formatDateTime } from "@/lib/utils";

export type EnrichedAttempt = {
  id: string;
  testId: string;
  studentId: string;
  startedAt: string;
  submittedAt: string | null;
  timedOutAt: string | null;
  score: number | null;
  passed: boolean | null;
  status: string;
  student: {
    id: string;
    email: string | null;
    fullName: string | null;
    role: string;
  };
};

type AttemptRow = EnrichedAttempt & { maxScore: number };

function formatTimeTaken(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "-";
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  if (end <= start) return "-";

  const { hours = 0, minutes = 0, seconds = 0 } = intervalToDuration({ start, end });

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} soat`);
  if (minutes > 0) parts.push(`${minutes} daqiqa`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} soniya`);
  return parts.join(" ");
}

function NatijaCell({ attempt }: { attempt: AttemptRow }) {
  if (attempt.status === "in_progress") {
    return <Badge variant="outline">Jarayonda</Badge>;
  }
  if (attempt.passed === true) {
    return <Badge variant="success">O&apos;tdi</Badge>;
  }
  if (attempt.passed === false) {
    return <Badge variant="error">O&apos;tmadi</Badge>;
  }
  if (attempt.status === "submitted") {
    return <Badge variant="outline">Topshirildi</Badge>;
  }
  return null;
}

const columns: ColumnDef<AttemptRow>[] = [
  {
    id: "talaba",
    header: "Talaba ismi",
    cell: ({ row }) =>
      row.original.student?.fullName ??
      row.original.student?.email ??
      "Noma'lum",
  },
  {
    accessorKey: "score",
    header: "Ball",
    cell: ({ row }) => row.original.score ?? 0,
  },
  {
    id: "maksimalBall",
    header: "Maksimal ball",
    cell: ({ row }) => row.original.maxScore,
  },
  {
    id: "natija",
    header: "Natija",
    cell: ({ row }) => <NatijaCell attempt={row.original} />,
  },
  {
    id: "holat",
    header: "Holat",
    cell: ({ row }) => {
      const { status } = row.original;
      if (status === "submitted")
        return <Badge variant="success">Topshirilgan</Badge>;
      if (status === "timed_out")
        return <Badge variant="warning">Vaqt tugadi</Badge>;
      return <Badge variant="outline">Jarayonda</Badge>;
    },
  },
  {
    id: "topshirilganVaqt",
    header: "Topshirilgan vaqt",
    cell: ({ row }) => {
      const endedAt = row.original.submittedAt ?? row.original.timedOutAt;
      if (!endedAt) return "-";
      return formatDateTime(endedAt);
    },
  },
  {
    id: "sarflanganVaqt",
    header: "Sarflangan vaqt",
    cell: ({ row }) => {
      const endedAt = row.original.submittedAt ?? row.original.timedOutAt;
      return formatTimeTaken(row.original.startedAt, endedAt);
    },
  },
];

interface ResultsTableProps {
  attempts: AttemptRow[];
}

export function ResultsTable({ attempts }: ResultsTableProps) {
  if (attempts.length === 0) {
    return (
      <p className="text-gray-500">Hali hech kim bu testni topshirmagan.</p>
    );
  }

  return <DataTable columns={columns} data={attempts} />;
}
