import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PaymentProcess } from "@/components/sections/payment-process";
import { PaymentSchedule } from "@/components/sections/payment-schedule";
import { PaymentMethodsGrid } from "@/components/sections/payment-methods-grid";

type Props = { params: { locale: string } };

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
