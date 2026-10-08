"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { FileText, ScrollText, FileSignature, PackageCheck } from "lucide-react";

const steps = [
  { key: "quote", Icon: FileText },
  { key: "mission", Icon: ScrollText },
  { key: "contract", Icon: FileSignature },
  { key: "delivery", Icon: PackageCheck },
] as const;

export function PaymentProcess() {
  const t = useTranslations("Pages.resources.paiement");

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{t("processTitle")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("processDescription")}</p>

        <div className="relative mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.12 }}
              className="relative rounded-2xl border border-primary/10 bg-primary/[0.03] p-6"
            >
              <span className="relative z-10 grid h-9 w-9 place-items-center rounded-full bg-[#7A35FF] text-sm font-bold text-white shadow-md shadow-[#7A35FF]/25">
                {index + 1}
              </span>
              <Icon className="mt-4 h-6 w-6 text-[#7A35FF]" aria-hidden />
              <h3 className="mt-3 font-semibold text-primary">{t(`process.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`process.${key}.description`)}
              </p>
            </m.div>
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}
