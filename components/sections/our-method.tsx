"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

const steps = [
  {
    id: "01",
    image: "/images/our-method/discovery-vision.png",
    key: "discovery",
    reversed: false,
  },
  {
    id: "02",
    image: "/images/our-method/design-prototype.jpg",
    key: "design",
    reversed: true,
  },
  {
    id: "03",
    image: "/images/our-method/build-scale.jpg",
    key: "build",
    reversed: false,
  },
] as const;

function StepBlock({
  step,
}: {
  step: (typeof steps)[number];
}) {
  const t = useTranslations("ourMethod");

  return (
    <div
      className={`flex flex-col items-center gap-8 md:gap-16 lg:gap-20 ${
        step.reversed ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <div className="w-full md:w-1/2">
        <div className="rounded-2xl bg-[#292D32]/[0.08] p-4 sm:p-6">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image
              src={step.image}
              alt={t(`steps.${step.key}.title`)}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <span className="inline-block rounded-full bg-[#7A35FF] px-3 py-1 text-xs font-bold tracking-wide text-[#FFFFFF]">
          {step.id}
        </span>
        <h3 className="mt-4 text-2xl font-bold text-[#292D32] md:text-3xl lg:text-4xl">
          {t(`steps.${step.key}.title`)}
        </h3>
        <p className="mt-3 max-w-lg text-base leading-relaxed text-[#292D32]/70 md:text-lg">
          {t(`steps.${step.key}.description`)}
        </p>
        <a
          href="#"
          className="mt-5 inline-flex items-center text-sm font-semibold text-[#292D32] transition-opacity hover:opacity-70"
        >
          {t("learnMore")}
        </a>
      </div>
    </div>
  );
}

export default function OurMethod() {
  const t = useTranslations("ourMethod");

  return (
    <section className="bg-[#F0F2F5] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-2xl md:mb-20">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#292D32]/60">
            {t("label")}
          </p>
          <h2 className="text-3xl font-bold text-[#292D32] md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#292D32]/70 md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-16 md:gap-24 lg:gap-28">
          {steps.map((step) => (
            <StepBlock key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
