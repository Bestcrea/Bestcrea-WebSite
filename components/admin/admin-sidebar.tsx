"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import {
  ClipboardList,
  FileSignature,
  FileText,
  Handshake,
  Receipt,
  Truck,
  History,
  Kanban,
  KeyRound,
  Languages,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { adminNav } from "@/lib/admin-nav";
import { ROLE_LABELS } from "@/lib/rbac";

const icons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  users: Users,
  kanban: Kanban,
  receipt: Receipt,
  filetext: FileSignature,
  clipboard: ClipboardList,
  truck: Truck,
  layers: Layers,
  file: FileText,
  news: Newspaper,
  handshake: Handshake,
  languages: Languages,
  shield: ShieldCheck,
  key: KeyRound,
  history: History,
  settings: Settings,
};

type Props = {
  userName?: string | null;
  role?: string;
  /** Effective permissions of the signed-in staff member. */
  permissions: string[];
};

export function AdminSidebar({ userName, role, permissions }: Props) {
  const pathname = usePathname();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const can = (permission?: string) => !permission || role === "admin" || permissions.includes(permission);

  const groups = adminNav
    .map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0);

  const content = (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-lg font-semibold tracking-tight">
          Bestcrea <span className="text-[#7A35FF]">Admin</span>
        </p>
        <p className="mt-1 truncate text-xs text-white/60">
          {userName || "Staff"} · {ROLE_LABELS[role ?? ""] ?? role}
        </p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.title ?? "root"}>
            {group.title ? (
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                {group.title}
              </p>
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = icons[item.icon] ?? FileText;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-[#7A35FF] text-[#FFFFFF]"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
        >
          <LogOut className="me-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-[#2a1233] text-white lg:flex">
        {content}
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/10 bg-[#2a1233] px-4 py-3 text-white lg:hidden">
        <p className="font-semibold">
          Bestcrea <span className="text-[#7A35FF]">Admin</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85%] flex-col bg-[#2a1233] text-white transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10"
          aria-label="Fermer le menu"
        >
          <X className="h-4 w-4" />
        </button>
        {content}
      </aside>
    </>
  );
}
