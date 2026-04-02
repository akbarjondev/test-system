"use client";

import { deleteTest } from "@/actions/tests";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteTestButton({ testId }: { testId: string }) {
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
