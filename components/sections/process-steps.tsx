import {
  ClipboardList,
  Code2,
  Headphones,
  Palette,
  Rocket,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const steps = [
  { key: "analysis", icon: ClipboardList },
  { key: "design", icon: Palette },
  { key: "development", icon: Code2 },
  { key: "delivery", icon: Rocket },
  { key: "support", icon: Headphones },
] as const;

export async function ProcessSteps() {
  const t = await getTranslations("HomePage.process");

  return (
    <section className="overflow-hidden border-y border-primary/5 bg-primary/[0.03] px-4 py-20 sm:px-6 lg:px-8">
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

        <div className="relative mt-14 grid gap-6 md:grid-cols-5">
          <div className="pointer-events-none absolute start-[10%] end-[10%] top-10 hidden h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent md:block" />
          {steps.map(({ key, icon: Icon }, index) => (
            <article key={key} className="relative text-center">
              <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl border border-primary/10 bg-background text-primary shadow-lg shadow-primary/5">
                <Icon className="h-7 w-7" aria-hidden />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground/70">
                0{index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-primary">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`steps.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
