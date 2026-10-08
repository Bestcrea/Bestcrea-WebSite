import { NextRequest, NextResponse } from "next/server";
import { requireClientApi } from "@/lib/client-api";
import { prisma } from "@/lib/prisma";
import { paypalEnabled } from "@/lib/payment-config";
import { createPaypalOrder } from "@/lib/paypal";

/** Start a PayPal payment for the signed-in client's own pending order. Returns the PayPal approval URL. */
export async function POST(request: NextRequest) {
  const auth = await requireClientApi();
  if (auth.error) return auth.error;
  if (!paypalEnabled()) return NextResponse.json({ error: "PayPal indisponible." }, { status: 400 });

  const { orderId, locale } = (await request.json().catch(() => ({}))) as { orderId?: string; locale?: string };
  const lang = ['fr', 'en', 'es', 'de', 'ar'].includes(String(locale)) ? String(locale) : 'fr';
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || request.nextUrl.origin;
  const order = orderId
    ? await prisma.order.findFirst({
        where: { id: orderId, userId: auth.session.user.id, paymentStatus: { in: ["pending", "submitted"] }, status: { not: "cancelled" } },
        include: { payments: { where: { method: "paypal" }, orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : null;
  if (!order || !order.payments[0]) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  try {
    // The amount is taken from OUR order, never from the request.
    const pp = await createPaypalOrder({ reference: order.number, amountMad: Number(order.total),
      returnUrl: `${origin}/${lang}/espace-client/commandes/${order.id}`,
      cancelUrl: `${origin}/${lang}/espace-client/commandes/${order.id}?cancelled=1`,
    });
    const approve = pp.links.find((l) => l.rel === "approve" || l.rel === "payer-action")?.href;
    if (!approve) throw new Error("No approval link");
    await prisma.payment.update({ where: { id: order.payments[0].id }, data: { providerPayload: { paypalOrderId: pp.id } } });
    return NextResponse.json({ ok: true, approveUrl: approve });
  } catch (error) {
    console.error("[paypal.create]", error);
    return NextResponse.json({ error: "Impossible de démarrer le paiement PayPal." }, { status: 502 });
  }
}
