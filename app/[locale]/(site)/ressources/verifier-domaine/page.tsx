import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { DomainChecker } from "@/components/sections/domain-checker";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildPageMetadata({ locale: params.locale, path: "ressources/verifier-domaine", seoKey: "verifier-domaine" });
}

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
