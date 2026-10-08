"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { getPortfolioCategories, type PortfolioSite } from "@/lib/portfolio-sites";
import { WebsiteBrowserCard } from "@/components/sections/website-browser-card";

type PortfolioFilterGridProps = {
  sites: PortfolioSite[];
  /** Max cards to show once a filter (or "all") is applied. Omit to show everything. */
  limit?: number;
};

export function PortfolioFilterGrid({ sites, limit }: PortfolioFilterGridProps) {
  const t = useTranslations("HomePage.portfolio");
  const categories = useMemo(() => getPortfolioCategories(), []);
  const [active, setActive] = useState<string | null>(null);

  const filtered = active ? sites.filter((site) => site.category === active) : sites;
  const visible = limit ? filtered.slice(0, limit) : filtered;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
            active === null
              ? "border-[#7A35FF] bg-[#7A35FF] text-white"
              : "border-primary/10 bg-primary/[0.03] text-primary/70 hover:border-[#7A35FF]/40"
          )}
        >
          {t("allCategories")}
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
              active === category
                ? "border-[#7A35FF] bg-[#7A35FF] text-white"
                : "border-primary/10 bg-primary/[0.03] text-primary/70 hover:border-[#7A35FF]/40"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((site) => (
          <WebsiteBrowserCard key={site.slug} site={site} />
        ))}
      </div>
    </div>
  );
}
