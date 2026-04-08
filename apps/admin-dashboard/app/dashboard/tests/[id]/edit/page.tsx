import { API_ROUTES, ROUTES } from "@/config/enums";
import { API_URL } from "@/config/constants";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormEditTest } from "./ui/FormEditTest";
import { Test } from "@test-system/database/prisma/generated/client";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getAuthOrRedirect();

  const res = await fetch(`${API_URL}${API_ROUTES.TESTS}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) redirect(ROUTES.LOGIN);
  if (!res.ok) throw new Error("Test ma'lumotlarini yuklashda xatolik yuz berdi");
  const test = (await res.json()) as Test;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">Testni tahrirlash</h1>
      <FormEditTest test={test} />
    </Card>
  );
}
