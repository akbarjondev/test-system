import { API_ROUTES, ROUTES } from "@/config/enums";
import { API_URL } from "@/config/constants";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { TestWithRelations } from "@test-system/types";
import { ResultsTable, EnrichedAttempt } from "./results-table";

export default async function TestResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAuthOrRedirect();

  const [testRes, attemptsRes] = await Promise.all([
    fetch(`${API_URL}${API_ROUTES.TESTS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`${API_URL}/api/tests/${id}/attempts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);

  if (testRes.status === 401 || testRes.status === 403) redirect(ROUTES.LOGIN);
  if (!testRes.ok)
    throw new Error("Test ma'lumotlarini yuklashda xatolik yuz berdi");
  if (attemptsRes.status === 401 || attemptsRes.status === 403)
    redirect(ROUTES.LOGIN);
  if (!attemptsRes.ok)
    throw new Error("Natijalarni yuklashda xatolik yuz berdi");

  const test = (await testRes.json()) as TestWithRelations;
  const attempts = (await attemptsRes.json()) as EnrichedAttempt[];

  const questionCount = test.questions?.length ?? 0;
  const pointsPerQuestion = test.pointsPerQuestion ?? 1;
  const maxScore = questionCount * pointsPerQuestion;

  const enrichedAttempts = attempts.map((attempt) => ({
    ...attempt,
    maxScore,
  }));

  return (
    <section>
      <h1 className="text-2xl font-bold mb-1">{test.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Jami urinishlar: {attempts.length}
      </p>

      <ResultsTable attempts={enrichedAttempts} />
    </section>
  );
}
