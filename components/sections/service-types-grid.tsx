"use client";

import { useTranslations } from "next-intl";
import {
  BarChart3,
  Bot,
  Cloud,
  Code2,
  Globe2,
  MapPin,
  Palette,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { serviceCategories } from "@/lib/navigation";

const icons: Record<string, LucideIcon> = {
  code: Code2,
  smartphone: Smartphone,
  cloud: Cloud,
  globe: Globe2,
  refresh: RefreshCw,
  bot: Bot,
  palette: Palette,
  search: Search,
  server: Server,
  chart: BarChart3,
  shield: ShieldCheck,
  map: MapPin,
};

export function ServiceTypesGrid() {
  const t = useTranslations("Pages.resources.stories");
  const tNav = useTranslations("Navigation");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-primary">{t("serviceTypesTitle")}</h2>
      <p className="mt-2 max-w-xl text-muted-foreground">{t("serviceTypesDescription")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {serviceCategories.map((item) => {
          const Icon = icons[item.icon ?? "code"] ?? Code2;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="group flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] p-5 transition-colors hover:border-[#7A35FF]/30 hover:bg-white"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#7A35FF] shadow-sm transition-colors group-hover:bg-[#7A35FF] group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold text-primary">
                  {tNav(item.key)}
                </span>
                {item.descriptionKey ? (
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {tNav(item.descriptionKey)}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
