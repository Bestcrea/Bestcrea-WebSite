"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type TabKey = "email" | "phone" | "address";

const TABS: { key: TabKey; icon: typeof Mail }[] = [
  { key: "email", icon: Mail },
  { key: "phone", icon: Phone },
  { key: "address", icon: MapPin },
];

export function ContactInfoTabs() {
  const t = useTranslations("Pages.contact");
  const [active, setActive] = useState<TabKey>("email");

  return (
    <section className="bg-[#F0F2F5] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-[#292D32] md:text-3xl">
          {t("infoTitle")}
        </h2>

        <div className="mt-8 flex justify-center gap-2 rounded-full bg-white p-1.5 shadow-sm">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                active === key
                  ? "bg-[#7A35FF] text-white"
                  : "text-[#292D32]/60 hover:text-[#292D32]"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{t(`${key}Label`)}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-[#292D32]/10 bg-white p-8 text-center">
          {active === "email" ? (
            <a
              href="mailto:contact@bestcrea.com"
              className="text-lg font-semibold text-[#292D32] hover:text-[#7A35FF]"
            >
              contact@bestcrea.com
            </a>
          ) : null}
          {active === "phone" ? (
            <a
              href="tel:+212636499140"
              className="text-lg font-semibold text-[#292D32] hover:text-[#7A35FF]"
            >
              +212 636 499 140
            </a>
          ) : null}
          {active === "address" ? (
            <p className="text-lg font-semibold text-[#292D32]">{t("address")}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
