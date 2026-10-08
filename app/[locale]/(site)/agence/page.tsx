import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { FounderSection } from "@/components/sections/founder-section";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props) {
  const t = await getTranslations({ locale: params.locale, namespace: "Pages.agency" });
  return buildPageMetadata({
    locale: params.locale,
    path: "agence",
    pageKey: "about",
    title: t("title"),
    description: t("description"),
  });
}

const valueKeys = ["excellence", "transparency", "speed", "partnership"] as const;
const historyKeys = ["founding", "firstClients", "structuring", "today"] as const;

export default async function AgencePage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.agency");

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        ctaHref="/contact"
        ctaLabel={t("cta")}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-primary">{t("presentationTitle")}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("presentationBody")}
            </p>
          </div>
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
            <h3 className="text-lg font-semibold text-accent">{t("storyTitle")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">
              {t("storyBody")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{t("historyTitle")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("historyDescription")}</p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {historyKeys.map((key, index) => (
            <div key={key} className="relative rounded-2xl border border-primary/10 bg-primary/[0.03] p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#7A35FF] text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-primary">
                {t(`history.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`history.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-primary/5 bg-primary/[0.03] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-primary/10 bg-background p-8">
            <h2 className="text-xl font-semibold text-primary">{t("missionTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("missionBody")}</p>
          </article>
          <article className="rounded-3xl border border-primary/10 bg-background p-8">
            <h2 className="text-xl font-semibold text-primary">{t("visionTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("visionBody")}</p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-primary">{t("valuesTitle")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueKeys.map((key) => (
            <article
              key={key}
              className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5"
            >
              <h3 className="font-semibold text-primary">{t(`values.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`values.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <FounderSection />
    </>
  );
}
