import { API_ROUTES } from "@/config/enums";
import { API_URL } from "@/config/constants";
import { getToken } from "@/lib/server-utils";
import { Card } from "@/components/ui/card";
import { FormEditTest } from "./ui/FormEditTest";
import { Test } from "@test-system/database/prisma/generated/client";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getToken();

  const res = await fetch(`${API_URL}${API_ROUTES.TESTS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const test = (await res.json()) as Test;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Testni tahrirlash</h1>
      <FormEditTest test={test} />
    </Card>
  );
}
