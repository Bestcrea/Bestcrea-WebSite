import { NextRequest, NextResponse } from "next/server";
import { requireClientApi } from "@/lib/client-api";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/doc-number";
import { priceCart, validateCoupon } from "@/lib/checkout";
import { getPaymentOptions } from "@/lib/payment-config";
import { rateLimit } from "@/lib/rate-limit";
import { clean } from "@/lib/validators";
import { notifyClient, notifyStaff } from "@/lib/notify";
import { audit } from "@/lib/audit";

/** Create an order + pending payment for a plan. Prices and coupon are re-validated server-side. */
export async function POST(request: NextRequest) {
  const auth = await requireClientApi();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  if (!rateLimit(`checkout-order:${userId}`, 10, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Trop de commandes. Réessayez plus tard." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    planSlug?: string;
    couponCode?: string;
    method?: string;
    reference?: string;
    customerNotes?: string;
  };

  const plan = body.planSlug ? await prisma.pricingPlan.findFirst({ where: { slug: body.planSlug, isActive: true } }) : null;
  if (!plan) return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });

  const option = getPaymentOptions().find((o) => o.id === body.method);
  if (!option) return NextResponse.json({ error: "Méthode de paiement indisponible." }, { status: 400 });

  let coupon = null;
  if (body.couponCode?.trim()) {
    const result = await validateCoupon(body.couponCode, plan, Number(plan.price), userId);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    coupon = result.coupon;
  }

  const pricing = priceCart(Number(plan.price), 1, coupon);
  const reference = clean(body.reference, 120);
  const names = plan.name as Record<string, string>;
  const planName = names?.fr || names?.en || plan.slug;
  const submitted = option.kind !== "paypal" && !!reference;

  const order = await prisma.$transaction(async (tx) => {
    const number = await nextDocumentNumber("CMD", tx);
    const created = await tx.order.create({
      data: {
        number,
        userId,
        status: submitted ? "payment_submitted" : "awaiting_payment",
        paymentStatus: submitted ? "submitted" : "pending",
        paymentMethod: option.id,
        currency: plan.currency,
        subtotal: pricing.subtotal,
        discountTotal: pricing.discount,
        taxTotal: pricing.tax,
        total: pricing.total,
        couponId: coupon?.id ?? null,
        couponCode: coupon?.code ?? null,
        customerNotes: clean(body.customerNotes, 1000),
        items: {
          create: [
            {
              kind: "plan",
              pricingPlanId: plan.id,
              name: planName,
              quantity: 1,
              unitPrice: pricing.subtotal,
              discount: pricing.discount,
              total: pricing.totalHt,
            },
          ],
        },
        payments: {
          create: {
            method: option.id,
            status: submitted ? "submitted" : "pending",
            amount: pricing.total,
            currency: plan.currency,
            reference,
          },
        },
      },
      include: { payments: true },
    });
    if (coupon) {
      await tx.couponRedemption.create({
        data: { couponId: coupon.id, userId, orderId: created.id, amount: pricing.discount },
      });
    }
    return created;
  });

  await notifyStaff({
    type: "order.created",
    title: `Nouvelle commande ${order.number}`,
    body: `${planName} — ${pricing.total.toFixed(2)} ${plan.currency} (${option.label})`,
    href: `/admin/commandes/${order.id}`,
  });
  await notifyClient(userId, {
    type: "order.created",
    title: `Commande ${order.number} enregistrée`,
    body: option.kind === "paypal" ? "Finalisez le paiement PayPal." : "Nous vérifions votre paiement dès réception.",
    href: `/espace-client/commandes/${order.id}`,
  });
  await audit({ userId, action: "order.created", entity: "Order", entityId: order.id, request });

  return NextResponse.json({ ok: true, order: { id: order.id, number: order.number }, paymentId: order.payments[0]?.id }, { status: 201 });
}
