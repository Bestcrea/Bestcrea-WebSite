import type { Coupon, PricingPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_VAT } from "@/lib/totals";

/**
 * Server-side cart pricing. The browser only ever sends a plan slug and a coupon code;
 * every amount is recomputed here, so a tampered request can never change the price.
 * Plan prices are treated as HT; VAT is added on top.
 */

export type CartPricing = {
  subtotal: number;
  discount: number;
  totalHt: number;
  tax: number;
  total: number;
  vatRate: number;
};

const c = (n: number) => Math.round(n * 100);
const f = (n: number) => n / 100;

export function priceCart(unitPrice: number, quantity: number, coupon: Pick<Coupon, "discountType" | "value"> | null): CartPricing {
  const subtotalC = c(unitPrice) * quantity;
  let discountC = 0;
  if (coupon) {
    discountC =
      coupon.discountType === "percentage"
        ? Math.round((subtotalC * Math.min(100, Number(coupon.value))) / 100)
        : c(Number(coupon.value));
    discountC = Math.min(discountC, subtotalC);
  }
  const htC = subtotalC - discountC;
  const taxC = Math.round((htC * DEFAULT_VAT) / 100);
  return {
    subtotal: f(subtotalC),
    discount: f(discountC),
    totalHt: f(htC),
    tax: f(taxC),
    total: f(htC + taxC),
    vatRate: DEFAULT_VAT,
  };
}

export type CouponResult =
  | { ok: true; coupon: Coupon }
  | { ok: false; error: string };

/** Validate a coupon against the rules stored in the database. `userId` may be null before sign-up. */
export async function validateCoupon(
  rawCode: string,
  plan: Pick<PricingPlan, "id">,
  subtotal: number,
  userId: string | null
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase().slice(0, 40);
  if (!code) return { ok: false, error: "Code promo invalide." };

  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { plans: { select: { id: true } }, products: { select: { id: true } }, packs: { select: { id: true } } },
  });
  // Same message for unknown/inactive codes so codes cannot be enumerated.
  if (!coupon || !coupon.isActive) return { ok: false, error: "Code promo invalide ou expiré." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "Code promo invalide ou expiré." };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, error: "Code promo invalide ou expiré." };

  const restricted = coupon.plans.length + coupon.products.length + coupon.packs.length > 0;
  if (restricted && !coupon.plans.some((p) => p.id === plan.id)) {
    return { ok: false, error: "Ce code ne s'applique pas à cette offre." };
  }
  if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
    return { ok: false, error: `Montant minimum requis : ${Number(coupon.minOrderAmount)} DH.` };
  }
  if (coupon.usageLimit !== null) {
    const used = await prisma.couponRedemption.count({ where: { couponId: coupon.id } });
    if (used >= coupon.usageLimit) return { ok: false, error: "Ce code a atteint sa limite d'utilisation." };
  }
  if (coupon.perCustomerLimit !== null && userId) {
    const usedByUser = await prisma.couponRedemption.count({ where: { couponId: coupon.id, userId } });
    if (usedByUser >= coupon.perCustomerLimit) return { ok: false, error: "Vous avez déjà utilisé ce code." };
  }
  return { ok: true, coupon };
}
