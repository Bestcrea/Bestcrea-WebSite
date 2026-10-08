import {
  Gauge,
  Headphones,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const reasons = [
  { key: "speed", icon: Rocket },
  { key: "quality", icon: ShieldCheck },
  { key: "stack", icon: Layers3 },
  { key: "automation", icon: Sparkles },
  { key: "performance", icon: Gauge },
  { key: "support", icon: Headphones },
] as const;

export async function WhyBestCrea() {
  const t = await getTranslations("HomePage.why");

  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="rounded-2xl border border-transparent bg-primary/[0.03] p-6 transition-colors hover:border-accent/40 hover:bg-accent/10"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-primary">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
