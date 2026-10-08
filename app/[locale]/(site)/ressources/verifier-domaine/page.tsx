import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { DomainChecker } from "@/components/sections/domain-checker";

type Props = { params: { locale: string } };

export default async function CheckDomainPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.checkDomain");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <DomainChecker />
      </section>
    </>
  );
}
