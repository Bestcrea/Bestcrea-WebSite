"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  FileSignature,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/espace-client", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/espace-client/commandes", key: "orders", icon: ShoppingBag },
  { href: "/espace-client/projets", key: "projects", icon: FolderKanban },
  { href: "/espace-client/devis", key: "quotes", icon: FileSignature },
  { href: "/espace-client/bons-de-commande", key: "purchaseOrders", icon: ClipboardList },
  { href: "/espace-client/bons-de-livraison", key: "deliveryNotes", icon: Truck },
  { href: "/espace-client/factures", key: "invoices", icon: Receipt },
  { href: "/espace-client/support", key: "support", icon: LifeBuoy },
] as const;

type Props = {
  userName: string;
  userEmail: string;
  unread: number;
  children: ReactNode;
};

/** Professional client-portal frame: collapsible sidebar, top bar with notifications and user menu. */
export function PortalShell({ userName, userEmail, unread, children }: Props) {
  const t = useTranslations("ClientPortal");
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = (userName || userEmail || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem("portal_sidebar") === "collapsed");
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    setDrawer(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      try {
        window.localStorage.setItem("portal_sidebar", v ? "open" : "collapsed");
      } catch {
        /* storage unavailable */
      }
      return !v;
    });
  }

  const sidebar = (compact: boolean) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center justify-between px-4 pt-5", compact && "justify-center px-2")}>
        {compact ? (
          <Link href="/espace-client" aria-label="Bestcrea">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Bestcrea" className="h-9 w-9 object-contain" />
          </Link>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map((item) => {
          const active = "exact" in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={compact ? t(`nav.${item.key}`) : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition",
                compact && "justify-center px-0",
                active ? "bg-[#7A35FF]/10 text-[#6A2BE0]" : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {compact ? null : <span>{t(`nav.${item.key}`)}</span>}
            </Link>
          );
        })}
      </nav>

      {compact ? null : (
        <div className="m-3 rounded-2xl bg-[#7A35FF]/[0.07] p-4">
          <p className="text-2xl">👋</p>
          <p className="mt-2 font-semibold text-neutral-900">{t("nav.helpTitle")}</p>
          <p className="mt-1 text-sm text-neutral-600">{t("nav.helpText")}</p>
          <Link
            href="/espace-client/support"
            className="mt-3 inline-flex rounded-lg bg-[#7A35FF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6A2BE0]"
          >
            {t("nav.getHelp")}
          </Link>
        </div>
      )}

      <div className={cn("flex items-center gap-3 border-t px-4 py-4", compact && "justify-center px-2")}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7A35FF] text-sm font-bold text-white">{initial}</span>
        {compact ? null : (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">{userName}</p>
            <p className="truncate text-xs text-neutral-500">{userEmail}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F6F8] text-neutral-900">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-30 hidden border-e bg-white transition-[width] duration-200 lg:block",
          collapsed ? "w-[76px]" : "w-[272px]"
        )}
      >
        {sidebar(collapsed)}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={t("nav.collapse")}
          className="absolute -end-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border bg-white text-neutral-500 shadow-sm hover:text-[#7A35FF]"
        >
          {collapsed ? <ChevronsRight className="h-3.5 w-3.5 rtl:rotate-180" /> : <ChevronsLeft className="h-3.5 w-3.5 rtl:rotate-180" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 start-0 w-[280px] bg-white shadow-xl">
            <button type="button" onClick={() => setDrawer(false)} className="absolute end-3 top-4 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
            {sidebar(false)}
          </aside>
        </div>
      ) : null}

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:ps-[76px]" : "lg:ps-[272px]")}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setDrawer(true)} aria-label={t("nav.openMenu")} className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/tarifs"
              className="hidden items-center gap-2 rounded-xl bg-[#7A35FF] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6A2BE0] sm:inline-flex"
            >
              <ShoppingCart className="h-4 w-4" /> {t("nav.orderService")}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/espace-client/notifications"
              aria-label={t("nav.notifications")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border bg-white text-neutral-700 hover:bg-neutral-50"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-expanded={menu}
                className="flex items-center gap-2 rounded-full border bg-white py-1 pe-3 ps-1 hover:bg-neutral-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7A35FF] text-sm font-bold text-white">{initial}</span>
                <span className="hidden max-w-[120px] truncate text-sm font-semibold sm:block">{(userName || "").split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </button>
              {menu ? (
                <div className="absolute end-0 mt-2 w-72 overflow-hidden rounded-2xl border bg-white p-2 shadow-xl">
                  <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#7A35FF] font-bold text-white">{initial}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{userName}</p>
                      <p className="truncate text-xs text-neutral-500">{userEmail}</p>
                    </div>
                  </div>
                  <div className="my-2 flex items-center justify-between rounded-xl border px-3 py-2">
                    <span className="text-xs text-neutral-500">{t("nav.language")}</span>
                    <LanguageSwitcher variant="light" />
                  </div>
                  <Link href="/espace-client/profil" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-neutral-50">
                    <User className="h-4 w-4" /> {t("nav.myProfile")}
                  </Link>
                  <Link href="/espace-client/notifications" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-neutral-50">
                    <Bell className="h-4 w-4" /> {t("nav.notifications")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: `/${locale}/espace-client/login` })}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> {t("nav.logout")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
