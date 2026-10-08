import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { ComingSoonNotice } from "@/components/sections/coming-soon-notice";

type Props = { params: { locale: string } };

export default async function ProduitsSaasPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.produits");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <ComingSoonNotice />
      </section>
    </>
  );
}
