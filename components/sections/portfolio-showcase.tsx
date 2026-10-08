"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { portfolioSites } from "@/lib/portfolio-sites";
import { PortfolioFilterGrid } from "@/components/sections/portfolio-filter-grid";

export function PortfolioShowcase() {
  const t = useTranslations("HomePage.portfolio");

  if (portfolioSites.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">{t("title")}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("description")}</p>
        </div>
        <Link
          href="/ressources/realisations"
          className="inline-flex items-center text-sm font-semibold text-[#7A35FF] hover:underline"
        >
          {t("cta")} →
        </Link>
      </div>

      <div className="mt-8">
        <PortfolioFilterGrid sites={portfolioSites} limit={6} />
      </div>
    </section>
  );
}
