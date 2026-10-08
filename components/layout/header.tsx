"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, LogIn, Menu, UserPlus } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MegaMenuPanel } from "@/components/layout/mega-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PromoTopBar } from "@/components/layout/promo-top-bar";
import {
  resourceMegaGroups,
  resourcesMegaPromo,
  serviceMegaGroups,
  servicesMegaPromo,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

type MegaKey = "services" | "resources" | null;

export function Header() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const [mega, setMega] = useState<MegaKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMega(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mega) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMega(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mega]);

  function closeAll() {
    setMega(null);
    setMobileOpen(false);
  }

  const navLink = (active?: boolean) =>
    cn(
      "inline-flex items-center gap-1 px-1 py-2 text-sm font-medium transition-colors",
      active ? "text-[#292D32]" : "text-[#292D32]/60 hover:text-[#292D32]"
    );

  return (
    <header
      className="sticky top-0 z-50 border-b border-black/5 bg-white text-[#292D32] shadow-sm"
      onMouseLeave={() => setMega(null)}
    >
      <PromoTopBar />

      <div className="h-[3px] w-full bg-[#7A35FF]" aria-hidden />

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav
          className="ms-8 hidden items-center gap-6 lg:flex"
          aria-label="Main"
        >
          <Link href="/" className={navLink(pathname === "/")}>
            {t("home")}
          </Link>

          <div onMouseEnter={() => setMega("services")}>
            <button
              type="button"
              className={navLink(pathname.startsWith("/services"))}
              aria-expanded={mega === "services"}
              onClick={() =>
                setMega((current) => (current === "services" ? null : "services"))
              }
              onFocus={() => setMega("services")}
            >
              {t("services")}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  mega === "services" && "rotate-180"
                )}
              />
            </button>
          </div>

          <Link
            href="/agence"
            className={navLink(pathname.startsWith("/agence"))}
          >
            {t("agency")}
          </Link>

          <Link
            href="/tarifs"
            className={navLink(pathname.startsWith("/tarifs"))}
          >
            {t("tarifs")}
          </Link>

          <div onMouseEnter={() => setMega("resources")}>
            <button
              type="button"
              className={navLink(pathname.startsWith("/ressources"))}
              aria-expanded={mega === "resources"}
              onClick={() =>
                setMega((current) =>
                  current === "resources" ? null : "resources"
                )
              }
              onFocus={() => setMega("resources")}
            >
              {t("resources")}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  mega === "resources" && "rotate-180"
                )}
              />
            </button>
          </div>

          <Link
            href="/contact"
            className={navLink(pathname.startsWith("/contact"))}
          >
            {t("contact")}
          </Link>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="light" className="hidden sm:block" />

          <Link
            href="/espace-client/login"
            aria-label={t("login")}
            title={t("login")}
            className="hidden h-10 w-10 place-items-center rounded-full border border-black/10 text-[#292D32]/90 transition-colors hover:border-black/20 hover:bg-black/5 md:grid"
          >
            <LogIn className="h-[18px] w-[18px]" aria-hidden />
          </Link>
          <Link
            href="/espace-client/register"
            aria-label={t("register")}
            title={t("register")}
            className="hidden h-10 w-10 place-items-center rounded-full bg-[#7A35FF] text-white transition-opacity hover:opacity-90 md:grid"
          >
            <UserPlus className="h-[18px] w-[18px]" aria-hidden />
          </Link>

          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-[#292D32] lg:hidden"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            onClick={() => setMobileOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative z-30 hidden lg:block">
        {mega === "services" ? (
          <div className="absolute inset-x-0 top-0 px-4 pb-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <MegaMenuPanel
                labelKey="services"
                groups={serviceMegaGroups}
                promo={servicesMegaPromo}
                onNavigate={closeAll}
              />
            </div>
          </div>
        ) : null}
        {mega === "resources" ? (
          <div className="absolute inset-x-0 top-0 px-4 pb-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <MegaMenuPanel
                labelKey="resources"
                groups={resourceMegaGroups}
                promo={resourcesMegaPromo}
                onNavigate={closeAll}
              />
            </div>
          </div>
        ) : null}
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
