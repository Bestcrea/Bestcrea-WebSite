import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { NewsletterForm } from "@/components/sections/newsletter-form";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

const benefitKeys = ["insights", "offers", "launches"] as const;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  return buildPageMetadata({ locale: params.locale, path: "ressources/newsletter" });
}

export default async function NewsletterPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.newsletter");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {benefitKeys.map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5"
            >
              <p className="text-sm font-semibold text-primary">{t(`benefits.${key}`)}</p>
            </div>
          ))}
        </div>

        <NewsletterForm />

        <p className="mt-4 text-xs text-primary/40">{t("privacyNote")}</p>
      </section>
    </>
  );
}
