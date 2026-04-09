import { API_ROUTES, ROUTES } from "@/config/enums";
import { PaginatedResponse } from "@test-system/types";
import { Test } from "@test-system/database/prisma/generated/client";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { API_URL } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { TestsTable } from "./ui/TestsTable";

export default async function TestsPage() {
  const token = await getAuthOrRedirect();

  const response = await fetch(
    `${API_URL}${API_ROUTES.TESTS}?page=1&limit=1000`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (response.status === 401 || response.status === 403) redirect(ROUTES.LOGIN);
  if (!response.ok) throw new Error("Testlarni yuklashda xatolik yuz berdi");
  const testsData = (await response.json()) as unknown as PaginatedResponse<Test>;

  const tests = testsData.data;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Testlar</h1>
        <Button asChild>
          <Link href={ROUTES.TESTS_NEW}>
            <PlusIcon className="size-4 inline-flex" />
            Yangi test
          </Link>
        </Button>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Hali testlar yo&apos;q. Yangi test yarating.
          </p>
          <Button asChild>
            <Link href={ROUTES.TESTS_NEW}>Yangi test</Link>
          </Button>
        </div>
      ) : (
        <TestsTable tests={tests} />
      )}
    </div>
  );
}
