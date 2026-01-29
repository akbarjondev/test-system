import { ROUTES } from "@/config/enums";
import Link from "next/link";
import { LogoutButton } from "./ui/LogoutButton";
import { BackButton } from "./ui/BackButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <header className="bg-white dark:bg-black p-4 flex justify-between items-center">
        {/* @TODO: add breadcrumbs and logo*/}

        <nav className="flex items-center gap-4">
          <Link href={ROUTES.DASHBOARD}>Bosh sahifa</Link>
          <Link href={ROUTES.TESTS}>Testlar</Link>
          <Link href={ROUTES.STUDENTS}>O&apos;quvchilar</Link>
        </nav>

        <LogoutButton />
      </header>

      <main className="flex-1 p-4">
        <div className="mb-4">
          <BackButton />
        </div>
        {children}
      </main>

      <footer className="bg-white dark:bg-black p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Test tizimi.
        </p>
      </footer>
    </div>
  );
}
