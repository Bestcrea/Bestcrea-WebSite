import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PricingJsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, localizedPath } from "@/lib/seo";
import { pickLocale } from "@/lib/i18n-content";
import { PricingPlans } from "@/components/sections/pricing-plans";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  return buildPageMetadata({ locale: params.locale, path: "tarifs", seoKey: "tarifs" });
}

export default async function TarifsPage(props: Props) {
  const params = await props.params;
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
      <PricingJsonLd
        plans={serializedPlans.map((p) => ({
          name: pickLocale(p.name as never, params.locale, p.slug),
          description: pickLocale(p.description as never, params.locale),
          price: Number(p.price),
          currency: p.currency,
          url: absoluteUrl(localizedPath(params.locale, `checkout?plan=${p.slug}`)),
        }))}
      />
      <PricingPlans plans={serializedPlans} locale={params.locale} />
    </>
  );
}
