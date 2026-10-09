import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { ServiceTypesGrid } from "@/components/sections/service-types-grid";
import { ClientStories } from "@/components/sections/client-stories";
import { PricingPlans } from "@/components/sections/pricing-plans";
import { ServiceProcess } from "@/components/sections/service-process";
import { PaymentProcess } from "@/components/sections/payment-process";
import { GoogleReviewsSection } from "@/components/sections/google-reviews-section";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  return buildPageMetadata({ locale: params.locale, path: "ressources/stories" });
}

export default async function StoriesPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.stories");

  const stories = [
    { title: t("items.0.title"), body: t("items.0.body") },
    { title: t("items.1.title"), body: t("items.1.body") },
    { title: t("items.2.title"), body: t("items.2.body") },
  ];

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

      <ClientStories title={t("storiesTitle")} stories={stories} />

      <ServiceTypesGrid />

      <PricingPlans plans={serializedPlans} locale={params.locale} />

      <ServiceProcess />

      <PaymentProcess />

      <GoogleReviewsSection />
    </>
  );
}
