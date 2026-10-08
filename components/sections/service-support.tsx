"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { LifeBuoy, Wrench, GraduationCap, LineChart } from "lucide-react";

const items = [
  { key: "technical", Icon: LifeBuoy },
  { key: "maintenance", Icon: Wrench },
  { key: "training", Icon: GraduationCap },
  { key: "monitoring", Icon: LineChart },
] as const;

export function ServiceSupport() {
  const t = useTranslations("Pages.services");

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{t("supportTitle")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("supportDescription")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ key, Icon }, i) => (
            <m.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
              className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-6"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#7A35FF] text-white shadow-md shadow-[#7A35FF]/25">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold text-primary">{t(`support.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`support.${key}.description`)}
              </p>
            </m.div>
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}
