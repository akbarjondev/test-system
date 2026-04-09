import { Sidebar } from "./ui/Sidebar";
import { ConditionalBackButton } from "./ui/ConditionalBackButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      {/* pt-14 offsets the fixed mobile top bar; removed on md+ where sidebar is static */}
      <main className="flex-1 overflow-y-auto p-6 pt-20 md:pt-6">
        <ConditionalBackButton />
        {children}
      </main>
    </div>
  );
}
