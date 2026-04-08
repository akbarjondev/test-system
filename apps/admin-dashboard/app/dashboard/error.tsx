"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/enums";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <h2 className="text-xl font-semibold">Xatolik yuz berdi</h2>
      <p className="text-sm text-zinc-500 max-w-sm">
        {error.message || "Sahifani yuklashda xatolik. Iltimos, qayta urinib ko'ring."}
      </p>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm rounded-md bg-zinc-900 text-white hover:bg-zinc-700"
        >
          Qayta urinish
        </button>
        <button
          onClick={() => router.push(ROUTES.DASHBOARD)}
          className="px-4 py-2 text-sm rounded-md border border-zinc-200 hover:bg-zinc-50"
        >
          Bosh sahifaga
        </button>
      </div>
    </div>
  );
}
