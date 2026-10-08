import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PricingPlans } from "@/components/sections/pricing-plans";
import { prisma } from "@/lib/prisma";

type Props = { params: { locale: string } };

export default async function TarifsPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.tarifs");

  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const serializedPlans = plans.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    features: plan.features,
    ctaLabel: plan.ctaLabel,
    price: plan.price.toString(),
    originalPrice: plan.originalPrice?.toString() ?? null,
    discountAmount: plan.discountAmount?.toString() ?? null,
    currency: plan.currency,
    billingPeriod: plan.billingPeriod,
    isFeatured: plan.isFeatured,
  }));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <PricingPlans plans={serializedPlans} locale={params.locale} />
    </>
  );
}
