import { API_URL } from "@/config/constants";
import { ROUTES } from "@/config/enums";
import { getAuthOrRedirect } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AttemptsTable, type AttemptRow } from "./ui/AttemptsTable";
import {
  CheckCircle2Icon,
  ClipboardListIcon,
  ListFilterIcon,
  PlayCircleIcon,
} from "lucide-react";

type PaginatedAttempts = {
  data: AttemptRow[];
  pagination: { total: number };
};

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

export default async function AttemptsPage() {
  const token = await getAuthOrRedirect();

  const res = await fetch(`${API_URL}/api/attempts?limit=200`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) redirect(ROUTES.LOGIN);
  if (!res.ok) throw new Error("Natijalarni yuklashda xatolik yuz berdi");

  const result = (await res.json()) as PaginatedAttempts;
  const attempts = result.data ?? [];
  const total = result.pagination?.total ?? 0;
  const submittedInBatch = attempts.filter((a) => a.submittedAt).length;
  const inProgressInBatch = attempts.length - submittedInBatch;
  const isTruncated = total > attempts.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Natijalar</h1>
          <p className="text-sm text-muted-foreground max-w-prose">
            Barcha testlar bo&apos;yicha urinishlar: kim qachon boshlagan, topshirganmi va qanday
            ball olgan — bir joydan kuzating.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 self-start" asChild>
          <Link href={ROUTES.TESTS}>Testlar ro&apos;yxati</Link>
        </Button>
      </div>

      {attempts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={ClipboardListIcon}
            title="Jami urinishlar"
            value={total}
            description="Tizimda ro&apos;yxatdan o&apos;tgan barcha urinishlar soni."
          />
          <StatCard
            icon={ListFilterIcon}
            title="Ko&apos;rsatilmoqda"
            value={attempts.length}
            description={
              isTruncated
                ? "Hozirgi sahifada yuklangan yozuvlar (cheklangan ro'yxat)."
                : "Barcha urinishlar ro'yxatda."
            }
          />
          <StatCard
            icon={PlayCircleIcon}
            title="Jarayonda (bu ro'yxat)"
            value={inProgressInBatch}
            description="Hali topshirilmagan, faol urinishlar."
          />
          <StatCard
            icon={CheckCircle2Icon}
            title="Topshirilgan (bu ro'yxat)"
            value={submittedInBatch}
            description="Yakunlangan va ball qo'yilgan urinishlar."
          />
        </div>
      )}

      {isTruncated && (
        <div
          role="status"
          className="rounded-lg border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-foreground"
        >
          <span className="font-medium text-warning-foreground">Eslatma: </span>
          Jami {total} ta urinishdan {attempts.length} tasi yuklandi. To&apos;liq tarix uchun keyinroq
          sahifalash qo&apos;llaniladi.
        </div>
      )}

      {attempts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <ClipboardListIcon className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold">Hali urinishlar yo&apos;q</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground text-pretty">
              O&apos;quvchilar testni boshlagach, ular shu yerda ko&apos;rinadi. Avvalo test yarating
              va ularni tizimga ulang.
            </p>
            <Button className="mt-6" asChild>
              <Link href={ROUTES.TESTS}>Testlarga o&apos;tish</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">Urinishlar jadvali</h2>
            <p className="text-sm text-muted-foreground max-w-prose">
              Qidirish va holat bo&apos;yicha filtrlash. Qatorni bosib, shu testning batafsil
              natijalariga o&apos;tishingiz mumkin.
            </p>
          </div>
          <AttemptsTable attempts={attempts} />
        </section>
      )}
    </div>
  );
}
