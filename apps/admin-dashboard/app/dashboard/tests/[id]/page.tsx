import { API_ROUTES, ROUTES } from "@/config/enums";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { API_URL } from "@/config/constants";
import { TestWithRelations } from "@test-system/types";
import { PencilIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteTestButton } from "./ui/DeleteTestButton";
import { DeleteQuestionButton } from "./ui/DeleteQuestionButton";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAuthOrRedirect();

  const test = await fetch(`${API_URL}${API_ROUTES.TESTS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (test.status === 401 || test.status === 403) redirect(ROUTES.LOGIN);
  if (!test.ok) throw new Error("Test ma'lumotlarini yuklashda xatolik yuz berdi");
  const testData = (await test.json()) as unknown as TestWithRelations;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{testData.title}</h1>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`${ROUTES.TESTS}/${id}/edit`}>
              <PencilIcon className="size-4 mr-1" />
              Tahrirlash
            </Link>
          </Button>
          <DeleteTestButton testId={id} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-sm text-gray-500">Izoh:</span>
          <p>{testData.description}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Vaqt limiti:</span>
          <p>{formatDuration(testData.timeLimitMinutes)}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">
            Boshlanish va yopilish vaqtlari:
          </span>
          <p>
            {testData.isAlwaysAvailable
              ? "Har doim"
              : (testData.availableFrom ? formatDateTime(testData.availableFrom) : "?") +
                " dan " +
                (testData.availableUntil ? formatDateTime(testData.availableUntil) : "?") +
                " gacha"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Savollar soni:</span>
          <p>{testData.questions?.length}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">O&apos;tish bali:</span>
          <p>{testData.passingScore != null ? testData.passingScore : "Ko'rsatilmagan"}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button asChild>
          <Link href={`${ROUTES.TESTS}/${id}/questions`}>
            <PlusIcon className="size-4 mr-1" />
            Savol qo&apos;shish
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`${ROUTES.TESTS}/${id}/results`}>
            Natijalarni ko&apos;rish
          </Link>
        </Button>
      </div>

      {testData.questions && testData.questions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">Savollar:</h2>
          <ul className="flex flex-col gap-4">
            {testData.questions.map((question, index) => (
              <li key={question.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">
                    {index + 1}. {question.text}
                  </span>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <Button variant="outline" size="icon" asChild>
                      <Link
                        href={`${ROUTES.TESTS}/${id}/questions/${question.id}/edit`}
                      >
                        <PencilIcon className="size-4" />
                      </Link>
                    </Button>
                    <DeleteQuestionButton
                      questionId={question.id}
                      testId={id}
                    />
                  </div>
                </div>
                <ul className="flex flex-row gap-2 flex-wrap">
                  {question.options.map((option, optIdx) => (
                    <li
                      key={option.id}
                      className={cn(
                        option.isCorrect ? "text-green-600" : "text-red-500",
                        "flex flex-row items-center gap-1 text-sm",
                      )}
                    >
                      <span>{getOptionVariant(optIdx)}</span>
                      <span>{option.text}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const getOptionVariant = (index: number) => {
  switch (index) {
    case 0: return "a)";
    case 1: return "b)";
    case 2: return "c)";
    case 3: return "d)";
    default: return "";
  }
};
