import { getTranslations } from "next-intl/server";

const items = ["focus", "craft", "ownership", "impact"] as const;

export async function Differentiators() {
  const t = await getTranslations("HomePage.differentiators");

  return (
    <section className="bg-primary px-4 py-20 text-primary-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-primary-foreground/70">{t("description")}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map((key, index) => (
            <article
              key={key}
              className="rounded-3xl border border-primary-foreground/10 bg-primary-foreground/5 p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-xl font-semibold">{t(`items.${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                {t(`items.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
