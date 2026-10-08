import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickLocale, pickLocaleList } from "@/lib/i18n-content";

export const revalidate = 300;

/** Public, read-only list of active packs used by the chat assistant's recommendation card. */
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") || "fr";
  const plans = await prisma.pricingPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true, price: true, originalPrice: true, currency: true, features: true, discountAmount: true },
  });
  return NextResponse.json({
    plans: plans.map((p) => ({
      slug: p.slug,
      name: pickLocale(p.name as never, locale, p.slug),
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      currency: p.currency,
      features: pickLocaleList(p.features, locale),
      discountAmount: p.discountAmount ? Number(p.discountAmount) : null,
    })),
  });
}
