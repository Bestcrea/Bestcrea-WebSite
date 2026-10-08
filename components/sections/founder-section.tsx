"use client";

import Image from "next/image";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { techStack } from "@/lib/tech-icons";

export function FounderSection() {
  const t = useTranslations("HomePage.founder");

  return (
    <LazyMotion features={domAnimation} strict>
      <section id="fondateur" className="bg-[#F0F2F5] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-10">
          {/* Image */}
          <m.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none"
          >
            <div className="relative aspect-[4/4.6] w-full overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] bg-[#292D32]/5 shadow-xl shadow-[#292D32]/15">
              <Image
                src="/images/founder.webp"
                alt={t("name")}
                fill
                sizes="(max-width: 1024px) 60vw, 30vw"
                className="object-cover object-top"
              />
              <div
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
                aria-hidden
              />
            </div>

            {/* Accent frame */}
            <div
              className="pointer-events-none absolute -bottom-3 -end-3 -z-10 h-full w-full rounded-tl-[2.5rem] rounded-br-[2.5rem] border-2 border-[#7A35FF]/30"
              aria-hidden
            />

            {/* Floating badge — since */}
            <m.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -bottom-4 start-4 rounded-xl bg-white px-4 py-2 shadow-lg shadow-[#292D32]/10"
            >
              <p className="text-lg font-bold leading-none text-[#7A35FF]">2007</p>
              <p className="mt-0.5 text-[10px] font-medium text-[#292D32]/60">
                {t("since")}
              </p>
            </m.div>

            {/* Floating badge — quality guarantee */}
            <m.div
              initial={{ opacity: 0, y: -12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="absolute -top-4 end-4 flex items-center gap-2 rounded-xl bg-[#7A35FF] px-4 py-2 shadow-lg shadow-[#7A35FF]/20"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-white" aria-hidden />
              <p className="text-xs font-semibold leading-tight text-white">
                {t("qualityGuarantee")}
              </p>
            </m.div>
          </m.div>

          {/* Content */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#292D32]/60">
              {t("eyebrow")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#292D32] md:text-3xl">
              {t("name")}
            </h2>
            <span className="mt-2 inline-block rounded-md bg-[#7A35FF] px-2.5 py-1 text-xs font-semibold text-white">
              {t("role")}
            </span>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#292D32]/75">
              {t("bio")}
            </p>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#292D32]/75">
              {t("presentationBody")}
            </p>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#292D32]/50">
                {t("techStackTitle")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.map(({ Icon, bg, fg, label }, i) => (
                  <m.span
                    key={label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-1.5 rounded-full border border-[#292D32]/10 bg-white px-2 py-1 shadow-sm"
                  >
                    <span
                      className={`grid h-5 w-5 place-items-center rounded-md ${bg} ${fg}`}
                    >
                      <Icon className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="text-[11px] font-medium text-[#292D32]/80">
                      {label}
                    </span>
                  </m.span>
                ))}
              </div>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}
