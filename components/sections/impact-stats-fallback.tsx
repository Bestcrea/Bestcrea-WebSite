import { getTranslations } from "next-intl/server";

const stats = [
  { key: "clients", value: 120, suffix: "+" },
  { key: "projects", value: 260, suffix: "+" },
  { key: "roi", value: 38, suffix: "%" },
  { key: "countries", value: 18, suffix: "" },
] as const;

/** Static final numbers for SSR / LazySection fallback — no JS counters. */
export async function ImpactStatsFallback() {
  const t = await getTranslations("HomePage.impact");

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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-3xl border border-primary/10 bg-primary/[0.03] px-6 py-8 text-center"
            >
              <p className="text-4xl font-semibold tracking-tight text-primary md:text-5xl">
                {stat.value}
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
