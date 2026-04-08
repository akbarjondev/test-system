"use client";

import { deleteQuestion } from "@/actions/questions";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteQuestionButton({
  questionId,
  testId,
}: {
  questionId: string;
  testId: string;
}) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Savolni o'chirishni tasdiqlaysizmi?")) return;
    setPending(true);
    const result = await deleteQuestion(questionId, testId);
    if (result?.error) {
      toast.error(result.error);
      setPending(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={pending}
    >
      <Trash2Icon className="size-4" />
    </Button>
  );
}
