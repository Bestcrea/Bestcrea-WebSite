"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Search, PenTool, Code2, ShieldCheck, Rocket } from "lucide-react";

const steps = [
  { key: "discovery", Icon: Search },
  { key: "design", Icon: PenTool },
  { key: "development", Icon: Code2 },
  { key: "testing", Icon: ShieldCheck },
  { key: "launch", Icon: Rocket },
] as const;

export function ServiceProcess() {
  const t = useTranslations("Pages.services");

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="border-y border-primary/5 bg-primary/[0.03] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-semibold text-primary">{t("processTitle")}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{t("processDescription")}</p>

          <div className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <div
              className="pointer-events-none absolute inset-x-0 top-9 hidden h-px bg-primary/10 lg:block"
              aria-hidden
            />
            {steps.map(({ key, Icon }, index) => (
              <m.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                className="relative rounded-2xl border border-primary/10 bg-background p-5"
              >
                <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-[#7A35FF] text-sm font-bold text-white shadow-md shadow-[#7A35FF]/25">
                  {index + 1}
                </span>
                <Icon className="mt-4 h-5 w-5 text-[#7A35FF]" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold text-primary">
                  {t(`process.${key}.title`)}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {t(`process.${key}.description`)}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
