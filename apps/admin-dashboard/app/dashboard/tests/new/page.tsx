import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormTest } from "./ui/FormTest";

export default async function NewTestPage() {
  return (
    <div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yangi test qo'shish</CardTitle>
        </CardHeader>
        <CardContent>
          <FormTest />
        </CardContent>
      </Card>
    </div>
  );
}
