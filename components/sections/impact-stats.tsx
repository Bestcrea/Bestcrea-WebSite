"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

const stats = [
  { key: "clients", value: 120, suffix: "+" },
  { key: "projects", value: 260, suffix: "+" },
  { key: "roi", value: 38, suffix: "%" },
  { key: "countries", value: 18, suffix: "" },
] as const;

/** Animated counters — only mounted after LazySection viewport trigger. */
export default function ImpactStats() {
  const t = useTranslations("HomePage.impact");
  const ref = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("description")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-3xl border border-primary/10 bg-primary/[0.03] px-6 py-8 text-center"
            >
              <p className="text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                <AnimatedNumber value={stat.value} active={started} />
                {stat.suffix}
              </p>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {t(`items.${stat.key}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value, active }: { value: number; active: boolean }) {
  const [current, setCurrent] = useState(value);

  useEffect(() => {
    if (!active) return;
    setCurrent(0);

    const duration = 1200;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return <>{current}</>;
}
