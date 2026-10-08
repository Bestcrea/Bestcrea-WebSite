import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { priceCart, validateCoupon } from "@/lib/checkout";

/** Preview a coupon. Amounts are computed here from the DB, never from the browser. */
export async function POST(request: NextRequest) {
  const limited = rateLimit(clientKey(request, "coupon"), 20, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { planSlug?: string; code?: string };
  const plan = body.planSlug
    ? await prisma.pricingPlan.findFirst({ where: { slug: body.planSlug, isActive: true } })
    : null;
  if (!plan) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

  const session = await getServerSession(authOptions);
  const base = priceCart(Number(plan.price), 1, null);
  const result = await validateCoupon(String(body.code ?? ""), plan, base.subtotal, session?.user?.id ?? null);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({
    ok: true,
    code: result.coupon.code,
    pricing: priceCart(Number(plan.price), 1, result.coupon),
  });
}
