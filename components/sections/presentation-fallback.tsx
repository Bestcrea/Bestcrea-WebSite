import { getTranslations } from "next-intl/server";

/** Static SSR markup — used as LazySection fallback (no GSAP). */
export async function PresentationFallback() {
  const t = await getTranslations("HomePage.presentation");

  return (
    <section className="overflow-hidden border-y border-primary/5 bg-gradient-to-b from-background via-primary/[0.03] to-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{t("description")}</p>
          <ul className="mt-8 space-y-4">
            {(["step1", "step2", "step3"] as const).map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-primary/8 bg-background/80 p-4"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-primary">{t(`${step}.title`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`${step}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
          <div className="absolute inset-[8%] rounded-full border border-dashed border-primary/25" />
          <div className="absolute left-[29%] top-[8%] h-14 w-14 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_18px_rgba(122,53,255,0.35)]" />
          <div className="absolute bottom-[22%] right-[18%] h-11 w-11 rounded-full bg-accent shadow-[0_0_18px_rgba(122,53,255,0.35)]" />
          <div className="absolute bottom-[28%] left-[18%] h-8 w-8 rounded-full bg-primary/35" />
          <div
            className="absolute left-1/2 top-1/2 z-10 flex h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary"
            style={{
              boxShadow:
                "0 0 60px rgba(41,45,50,0.35), 0 10px 30px rgba(41,45,50,0.2)",
            }}
          >
            <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground">
              Bestcrea
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
