"use client";

import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/espace-client", key: "dashboard", exact: true },
  { href: "/espace-client/projets", key: "projects" },
  { href: "/espace-client/devis", key: "quotes" },
  { href: "/espace-client/bons-de-commande", key: "purchaseOrders" },
  { href: "/espace-client/bons-de-livraison", key: "deliveryNotes" },
  { href: "/espace-client/factures", key: "invoices" },
  { href: "/espace-client/support", key: "support" },
] as const;

export function ClientPortalNav({ userName }: { userName?: string | null }) {
  const t = useTranslations("ClientPortal");
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <header className="border-b border-primary/10 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <Link href="/espace-client" className="text-lg font-semibold text-primary">
            Bestcrea <span className="text-sm font-normal text-muted-foreground">{t("brandSuffix")}</span>
          </Link>
          {userName ? (
            <p className="text-xs text-muted-foreground">{t("hello", { name: userName })}</p>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const exact = "exact" in link && link.exact;
            const active = exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-primary/70 hover:bg-primary/5 hover:text-primary"
                )}
              >
                {t(`nav.${link.key}`)}
              </Link>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ms-2"
            onClick={() => signOut({ callbackUrl: `/${locale}/espace-client/login` })}
          >
            {t("nav.logout")}
          </Button>
        </nav>
      </div>
    </header>
  );
}
