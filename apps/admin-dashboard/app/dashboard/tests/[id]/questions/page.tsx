import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormQuestion } from "./ui/FormQuestion";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test savollarini qo'shish</CardTitle>
        </CardHeader>
        <CardContent>
          <FormQuestion testId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
