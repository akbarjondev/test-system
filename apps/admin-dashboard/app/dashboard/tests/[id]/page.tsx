import { API_ROUTES, ROUTES } from "@/config/enums";
import { getToken } from "@/lib/server-utils";
import dayjs from "dayjs";
import { cn, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { API_URL } from "@/config/constants";
import { TestWithRelations } from "@test-system/types";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();

  // get test by id
  const test = await fetch(`${API_URL}${API_ROUTES.TESTS}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const testData = (await test.json()) as unknown as TestWithRelations;

  return (
    <section>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{testData.title}</h1>

        <Button className="my-4" asChild>
          <Link href={`${ROUTES.TESTS}/${id}/questions`}>
            <PlusIcon className="size-4 inline-flex" />
            Test savollarini qo&apos;shish
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              : dayjs(testData.availableFrom).format("DD.MM.YYYY HH:mm") +
                " dan " +
                dayjs(testData.availableUntil).format("DD.MM.YYYY HH:mm") +
                " gacha"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Savollar soni:</span>
          <p>{testData.questions?.length}</p>
        </div>
      </div>

      <div>
        {testData && testData.questions && testData.questions.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Savollar:</h2>
            <ul className="flex flex-col gap-4">
              {testData.questions.map((question, index) => (
                <li key={question.id}>
                  <span>
                    {index + 1}. {question.text}
                  </span>
                  <ul className="flex flex-row gap-2">
                    {question.options.map((option, index) => (
                      <li
                        key={option.id}
                        className={cn(
                          option.isCorrect ? "text-green-500" : "text-red-500",
                          "flex flex-row items-center gap-2",
                        )}
                      >
                        <span>{getOptionVariant(index)}</span>
                        <span>{option.text}</span>
                      </li>
                    ))}
                  </ul>
                  {/* <span>{question.explanation}</span> */}
                  {/* <Button className="cursor-pointer hover:bg-red-500" size={"icon"} onClick={() => deleteQuestion(question.id)}>
                        <Trash2Icon className="size-4" />
                    </Button> */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

const getOptionVariant = (index: number) => {
  switch (index) {
    case 0:
      return "a)";
    case 1:
      return "b)";
    case 2:
      return "c)";
    case 3:
      return "d)";
    default:
      return "";
  }
};
