import { FormQuestion } from "./ui/FormQuestion";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-10">Yangi savol qo'shish</h1>
      <FormQuestion testId={id} />
    </div>
  );
}
