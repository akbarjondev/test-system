import { API_ROUTES, ROUTES } from "@/config/enums";
import { PaginatedResponse } from "@test-system/types";
import { Test } from "@test-system/database/prisma/generated/client";
import {
  CalendarClockIcon,
  ClipboardListIcon,
  FileQuestionIcon,
  InfinityIcon,
  PlusIcon,
} from "lucide-react";
import Link from "next/link";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { API_URL } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TestsTable } from "./ui/TestsTable";

type TestRow = Test & { _count?: { questions: number } };

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof ClipboardListIcon;
}) {
  return (
    <Card>
      <CardContent className="flex gap-4 pt-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TestsPage() {
  const token = await getAuthOrRedirect();

  const response = await fetch(`${API_URL}${API_ROUTES.TESTS}?page=1&limit=1000`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 403) redirect(ROUTES.LOGIN);
  if (!response.ok) throw new Error("Testlarni yuklashda xatolik yuz berdi");
  const testsData = (await response.json()) as unknown as PaginatedResponse<TestRow>;

  const tests = testsData.data;
  const totalFromApi = testsData.pagination?.total ?? tests.length;
  const isPartialList = tests.length < totalFromApi;
  const alwaysOpen = tests.filter((t) => t.isAlwaysAvailable).length;
  const scheduled = tests.filter((t) => !t.isAlwaysAvailable).length;
  const noQuestions = tests.filter((t) => (t._count?.questions ?? 0) === 0).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Testlar</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Testlar ro&apos;yxati: vaqt cheklovi, o&apos;tish bali va mavjudlik jadvali. Qatorni bosib tahrirlash,
            savollar va natijalarni boshqaring.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={ROUTES.ATTEMPTS}>Natijalar</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={ROUTES.TESTS_NEW} className="inline-flex items-center gap-2">
              <PlusIcon className="size-4 shrink-0" aria-hidden />
              Yangi test
            </Link>
          </Button>
        </div>
      </div>

      {tests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <ClipboardListIcon className="size-7 text-muted-foreground" aria-hidden />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-lg font-semibold">Hali test yo&apos;q</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Birinchi testni yarating — savollar, vaqt cheklovi va o&apos;tish balini keyinroq sozlab
                olishingiz mumkin.
              </p>
            </div>
            <Button asChild>
              <Link href={ROUTES.TESTS_NEW} className="inline-flex items-center gap-2">
                <PlusIcon className="size-4 shrink-0" aria-hidden />
                Yangi test yaratish
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={ClipboardListIcon}
              title="Jami testlar"
              value={totalFromApi}
              description={
                isPartialList
                  ? `Hozir jadvalda ${tests.length} ta ko'rsatilmoqda; jami ${totalFromApi} ta.`
                  : "Tizimdagi barcha testlar soni."
              }
            />
            <StatCard
              icon={InfinityIcon}
              title="Har doim ochiq"
              value={alwaysOpen}
              description={
                isPartialList
                  ? `Yuklangan ${tests.length} ta test ichidan har doim ochiq bo'lganlari.`
                  : "Talabalar istalgan vaqtda topshirishi mumkin bo'lgan testlar."
              }
            />
            <StatCard
              icon={CalendarClockIcon}
              title="Jadval bo'yicha"
              value={scheduled}
              description={
                isPartialList
                  ? `Yuklangan ro'yxatda faqat belgilangan vaqt oralig'ida ochiq bo'lganlar.`
                  : "Faqat belgilangan vaqt oralig'ida ochiq bo'lgan testlar."
              }
            />
            <StatCard
              icon={FileQuestionIcon}
              title="Savolsiz testlar"
              value={noQuestions}
              description={
                noQuestions > 0
                  ? "Savol qo'shishni unutmang — aks holda talabalar topshira olmaydi."
                  : isPartialList
                    ? "Yuklangan testlar bo'yicha — barchasida savol bor."
                    : "Barcha testlarda kamida bitta savol bor."
              }
            />
          </div>

          {isPartialList ? (
            <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-4 py-3">
              Jami {totalFromApi} ta test bor; hozir {tests.length} tasi yuklangan. Kartalar va jadval shu
              qismga tegishli — to&apos;liq ro&apos;yxat uchun keyinroq sahifalash qo&apos;shish mumkin.
            </p>
          ) : null}

          <TestsTable tests={tests} />
        </>
      )}
    </div>
  );
}
