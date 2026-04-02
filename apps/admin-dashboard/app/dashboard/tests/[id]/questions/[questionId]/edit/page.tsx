import { API_URL } from "@/config/constants";
import { getToken } from "@/lib/server-utils";
import { Card } from "@/components/ui/card";
import { FormEditQuestion } from "./ui/FormEditQuestion";
import { Question, Option } from "@test-system/database/prisma/generated/client";

type QuestionWithOptions = Question & { options: Option[] };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>;
}) {
  const { id, questionId } = await params;
  const token = await getToken();

  const res = await fetch(`${API_URL}/api/questions/${questionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const question = (await res.json()) as QuestionWithOptions;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Savolni tahrirlash</h1>
      <FormEditQuestion question={question} testId={id} />
    </Card>
  );
}
