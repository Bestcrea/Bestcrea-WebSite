import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { AffiliationForm } from "@/components/sections/affiliation-form";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  return buildPageMetadata({ locale: params.locale, path: "ressources/affiliation" });
}

export default async function AffiliationPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.affiliation");

  const benefits = [0, 1, 2].map((i) => t(`benefits.${i}`));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-[#292D32]">{t("howTitle")}</h2>
            <p className="mt-3 text-[#292D32]/70 leading-relaxed">{t("howBody")}</p>
            <ul className="mt-6 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2.5 text-sm text-[#292D32]/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#7A35FF]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <AffiliationForm />
        </div>
      </section>
    </>
  );
}
