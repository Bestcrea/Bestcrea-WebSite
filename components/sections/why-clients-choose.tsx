"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const CARDS = [
  {
    key: "web" as const,
    image: "/images/parallax/web.jpg",
    theme: "light" as const,
    hasCta: false,
  },
  {
    key: "app" as const,
    image: "/images/parallax/app.jpg",
    theme: "dark" as const,
    hasCta: false,
  },
  {
    key: "seo" as const,
    image: "/images/parallax/seo.jpg",
    theme: "light" as const,
    hasCta: true,
  },
] as const;

type CardDef = (typeof CARDS)[number];

function StickyCard({
  card,
  index,
  reducedMotion,
}: {
  card: CardDef;
  index: number;
  reducedMotion: boolean;
}) {
  const t = useTranslations("HomePage.whyClientsChoose");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const isDark = card.theme === "dark";

  const inner = (
    <div
      className={cn(
        "flex h-full w-full items-center px-4 py-20 sm:px-6 lg:px-8",
        isDark ? "bg-[#292D32]" : "bg-[#F0F2F5]"
      )}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <h3
            className={cn(
              "max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl",
              isDark ? "text-[#7A35FF]" : "text-[#292D32]"
            )}
          >
            {t(`panels.${card.key}.title`)}
          </h3>
          <p
            className={cn(
              "mt-5 max-w-lg text-base leading-relaxed sm:text-lg",
              isDark ? "text-white/85" : "text-[#292D32]/75"
            )}
          >
            {t(`panels.${card.key}.description`)}
          </p>
          {card.hasCta ? (
            <Link
              href="/services"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#7A35FF] px-6 py-3 text-sm font-semibold text-[#FFFFFF] transition-opacity hover:opacity-90"
            >
              {t("cta")}
            </Link>
          ) : null}
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg shadow-black/15">
            <Image
              src={card.image}
              alt={t(`panels.${card.key}.title`)}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (reducedMotion) {
    return <div className={cn("min-h-[100svh]", index === 0 && "lg:-mt-24")}>{inner}</div>;
  }

  return (
    <div
      ref={ref}
      className={cn("sticky top-0 h-[100svh]", index === 0 && "-mt-16 lg:-mt-28")}
      style={{ zIndex: index + 1 }}
    >
      <m.div
        className="h-full origin-top will-change-transform"
        style={{ scale }}
      >
        {inner}
      </m.div>
    </div>
  );
}

/**
 * Envato-style sticky stack (sticky + rising z-index).
 * Framer Motion (LazyMotion) scales/fades the card being covered.
 * Disabled when prefers-reduced-motion is active.
 */
export default function WhyClientsChoose() {
  const t = useTranslations("HomePage.whyClientsChoose");
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reducedMotion = mounted ? Boolean(prefersReduced) : false;

  return (
    <LazyMotion features={domAnimation} strict>
      <section aria-labelledby="why-clients-choose-title" className="bg-[#F0F2F5]">
        <div className="relative z-10 px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2
              id="why-clients-choose-title"
              className="max-w-3xl text-3xl font-semibold tracking-tight text-[#292D32] md:text-4xl lg:text-5xl"
            >
              {t("title")}
            </h2>
          </div>
        </div>

        <div>
          {CARDS.map((card, index) => (
            <StickyCard
              key={card.key}
              card={card}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </section>
    </LazyMotion>
  );
}
