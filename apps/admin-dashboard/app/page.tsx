import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/enums";
import { ClipboardList, BarChart2, MessageCircle } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: ClipboardList,
    title: "Testlar yarating",
    description:
      "Savollar, javob variantlari va vaqt limitini o'zingiz belgilang. Testlarni osongina tahrirlang va boshqaring.",
  },
  {
    icon: BarChart2,
    title: "Natijalarni kuzating",
    description:
      "Har bir o'quvchining natijasini real vaqtda kuzating. Batafsil hisobot va foiz ko'rsatkichlari.",
  },
  {
    icon: MessageCircle,
    title: "Telegram orqali yechiladi",
    description:
      "O'quvchilar testlarni to'g'ridan-to'g'ri Telegram botda yoki mobil ilovada yechishi mumkin.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">Test tizimi</span>
          <Button asChild size="sm">
            <Link href={ROUTES.LOGIN}>Kirish</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl">
          Online testlar platformasi
        </h1>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl">
          Testlar yarating, o&apos;quvchilarni boshqaring va natijalarni real vaqtda kuzating.
          Telegram bot va mobil ilova orqali ishlaydi.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={ROUTES.LOGIN}>Tizimga kirish</Link>
        </Button>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-3"
          >
            <Icon className="size-6 text-zinc-700 dark:text-zinc-300" />
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Test tizimi. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
}
