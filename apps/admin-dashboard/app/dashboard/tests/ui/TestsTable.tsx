"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Test } from "@test-system/database/prisma/generated/client";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/config/enums";
import { useState } from "react";
import { toast } from "sonner";
import { deleteTest } from "@/actions/tests";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import dayjs from "dayjs";

type TestWithCount = Test & { _count?: { questions: number }; questions?: { id: string }[] };

function DeleteButton({ testId }: { testId: string }) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Testni o'chirishni tasdiqlaysizmi?")) return;
    setPending(true);
    const result = await deleteTest(testId);
    if (result?.error) {
      toast.error(result.error);
      setPending(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2Icon className="size-4 mr-1" />
      {pending ? "O'chirilmoqda..." : "O'chirish"}
    </Button>
  );
}

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
      const from = test.availableFrom ? dayjs(test.availableFrom).format("DD.MM.YYYY") : "?";
      const until = test.availableUntil ? dayjs(test.availableUntil).format("DD.MM.YYYY") : "?";
      return `${from} – ${until}`;
    },
  },
  {
    id: "actions",
    header: "Amallar",
    cell: ({ row }) => {
      const test = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`${ROUTES.TESTS}/${test.id}/edit`}>
              <PencilIcon className="size-4 mr-1" />
              Tahrirlash
            </Link>
          </Button>
          <DeleteButton testId={test.id} />
        </div>
      );
    },
  },
];

interface TestsTableProps {
  tests: TestWithCount[];
}

export function TestsTable({ tests }: TestsTableProps) {
  return <DataTable columns={columns} data={tests} pageSize={10} />;
}
