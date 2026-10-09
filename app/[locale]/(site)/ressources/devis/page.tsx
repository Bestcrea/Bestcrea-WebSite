import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { QuoteRequestForm } from "@/components/sections/quote-request-form";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildPageMetadata({ locale: params.locale, path: "ressources/devis", seoKey: "devis" });
}

export default async function DevisPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.devis");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <QuoteRequestForm />
      </section>
    </>
  );
}
