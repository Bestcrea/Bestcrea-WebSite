"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";

const tranches = ["deposit", "milestone", "final"] as const;

export function PaymentSchedule() {
  const t = useTranslations("Pages.resources.paiement");

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="border-y border-primary/5 bg-primary/[0.03] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-primary">{t("scheduleTitle")}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("scheduleDescription")}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {tranches.map((key, index) => (
              <m.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.15 }}
                className="rounded-3xl border border-primary/10 bg-background p-8 text-center shadow-sm"
              >
                <m.p
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 + 0.1 }}
                  className="text-4xl font-bold text-[#7A35FF]"
                >
                  {t(`schedule.${key}.percent`)}
                </m.p>
                <h3 className="mt-3 font-semibold text-primary">
                  {t(`schedule.${key}.label`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`schedule.${key}.description`)}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
