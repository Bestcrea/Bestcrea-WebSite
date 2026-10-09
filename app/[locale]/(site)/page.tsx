import { setRequestLocale } from "next-intl/server";
import { HeroBanner } from "@/components/sections/hero-banner";
import { PromoSection } from "@/components/sections/promo-section";
import { ServicesMarketplace } from "@/components/sections/services-marketplace";
import { WhyBestCrea } from "@/components/sections/why-bestcrea";
import { FounderSection } from "@/components/sections/founder-section";
import { PricingPlans } from "@/components/sections/pricing-plans";
import { Differentiators } from "@/components/sections/differentiators";
import { WorldClientele } from "@/components/sections/world-clientele";
import { ProcessSteps } from "@/components/sections/process-steps";
import { FinalCta } from "@/components/sections/final-cta";
import { PartnersMarquee } from "@/components/sections/partners-marquee";
import { ImpactStatsFallback } from "@/components/sections/impact-stats-fallback";
import { PortfolioShowcase } from "@/components/sections/portfolio-showcase";
import {
  LazyImpactStats,
  LazyFaq,
  LazyWhyClientsChoose,
} from "@/components/sections/lazy-home-sections";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  return buildPageMetadata({ locale: params.locale, path: "", seoKey: "home" });
}

export default async function HomePage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);

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
      {/* Above-the-fold: pure Server Components, zero animation JS */}
      <HeroBanner />
      <PromoSection />
      <ServicesMarketplace />

      <WhyBestCrea />
      <FounderSection />
      <PricingPlans plans={serializedPlans} locale={params.locale} />

      <Differentiators />

      <WorldClientele />

      <LazyWhyClientsChoose>
        <div className="min-h-[100vh] bg-[#F0F2F5]" aria-hidden />
      </LazyWhyClientsChoose>

      <LazyImpactStats>
        <ImpactStatsFallback />
      </LazyImpactStats>

      <ProcessSteps />
      <PortfolioShowcase />
      <FinalCta />

      <LazyFaq>
        <div className="min-h-[40rem] bg-background" aria-hidden />
      </LazyFaq>

      <PartnersMarquee />
    </>
  );
}