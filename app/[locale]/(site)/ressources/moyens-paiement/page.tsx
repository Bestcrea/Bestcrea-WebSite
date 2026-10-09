import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PaymentProcess } from "@/components/sections/payment-process";
import { PaymentSchedule } from "@/components/sections/payment-schedule";
import { PaymentMethodsGrid } from "@/components/sections/payment-methods-grid";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildPageMetadata({ locale: params.locale, path: "ressources/moyens-paiement", seoKey: "moyens-paiement" });
}

export default async function MoyensPaiementPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.paiement");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <PaymentProcess />
      <PaymentSchedule />
      <PaymentMethodsGrid
        title={t("localTitle")}
        description={t("localDescription")}
        variant="local"
      />
      <PaymentMethodsGrid
        title={t("internationalTitle")}
        description={t("internationalDescription")}
        variant="international"
      />
    </>
  );
}
