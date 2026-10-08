import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { QuoteRequestForm } from "@/components/sections/quote-request-form";

type Props = { params: { locale: string } };

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
