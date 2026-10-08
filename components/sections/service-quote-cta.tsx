"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

export function ServiceQuoteCta() {
  const t = useTranslations("Pages.services");

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#4C1AC7] via-[#7A35FF] to-[#9B6BFF] px-8 py-14 text-center sm:px-14"
        >
          <div
            className="pointer-events-none absolute -top-16 -start-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -end-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <h2 className="relative text-2xl font-semibold text-white sm:text-3xl">
            {t("quoteCtaTitle")}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/80">
            {t("quoteCtaDescription")}
          </p>
          <Link
            href="/ressources/devis"
            className="relative mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#292D32] transition-transform hover:-translate-y-0.5"
          >
            {t("quoteCtaButton")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </m.div>
      </section>
    </LazyMotion>
  );
}
