"use client";

import { ROUTES } from "@/config/enums";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: ROUTES.DASHBOARD, label: "Bosh sahifa", icon: LayoutDashboard, exact: true },
  { href: ROUTES.TESTS, label: "Testlar", icon: ClipboardList, exact: false },
  { href: ROUTES.STUDENTS, label: "Foydalanuvchilar", icon: Users, exact: false },
  { href: ROUTES.ATTEMPTS, label: "Natijalar", icon: BarChart2, exact: false },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export const Sidebar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — hidden on small screens */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-bold text-lg tracking-tight">Test tizimi</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={() => logout()}
          >
            <LogOut className="size-4 shrink-0" />
            Chiqish
          </Button>
        </div>
      </aside>

      {/* Mobile top bar — visible only on small screens */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <span className="font-bold text-lg tracking-tight">Test tizimi</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menyuni ochish"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Mobile nav drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside className="relative z-50 flex flex-col w-64 max-w-[80vw] min-h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-lg tracking-tight">Test tizimi</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menyuni yopish"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </nav>

            <div className="px-3 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
              >
                <LogOut className="size-4 shrink-0" />
                Chiqish
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
