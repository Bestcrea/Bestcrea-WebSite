import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pickLocale, pickLocaleList } from "@/lib/i18n-content";
import { priceCart } from "@/lib/checkout";
import { getPaymentOptions } from "@/lib/payment-config";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ plan?: string }> };

export const metadata: Metadata = { title: "Commande", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  setRequestLocale(params.locale);

  const plan = searchParams.plan
    ? await prisma.pricingPlan.findFirst({ where: { slug: searchParams.plan, isActive: true } })
    : null;

  if (!plan) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-xl font-semibold">Offre introuvable</h1>
        <p className="mt-2 text-sm text-neutral-600">Choisissez une offre pour continuer votre commande.</p>
        <Link href="/tarifs" className="mt-5 inline-flex rounded-xl bg-[#7A35FF] px-5 py-2.5 text-sm font-semibold text-white">
          Voir les tarifs
        </Link>
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  const authed = !!session?.user?.id && session.user.role === "client";

  // Bank details are only sent to the browser once the visitor is signed in.
  const options = authed ? getPaymentOptions() : [];

  return (
    <CheckoutFlow
      authed={authed}
      userName={authed ? session?.user?.name ?? session?.user?.email ?? "" : ""}
      plan={{
        slug: plan.slug,
        name: pickLocale(plan.name as never, params.locale),
        description: pickLocale(plan.description as never, params.locale),
        features: pickLocaleList(plan.features as never, params.locale),
        currency: plan.currency,
        billingPeriod: plan.billingPeriod,
        originalPrice: plan.originalPrice ? Number(plan.originalPrice) : null,
      }}
      basePricing={priceCart(Number(plan.price), 1, null)}
      options={options}
    />
  );
}
