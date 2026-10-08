import { NextRequest, NextResponse } from "next/server";
import { requireClientApi } from "@/lib/client-api";
import { prisma } from "@/lib/prisma";
import { paypalEnabled } from "@/lib/payment-config";
import { capturePaypalOrder, PAYPAL_CURRENCY, toPaypalAmount } from "@/lib/paypal";
import { confirmPayment } from "@/lib/payments";

/**
 * Called when the client returns from PayPal. The payment is marked paid ONLY after PayPal confirms
 * the capture server-to-server, with the amount/currency we expect and a never-seen-before capture id.
 */
export async function POST(request: NextRequest) {
  const auth = await requireClientApi();
  if (auth.error) return auth.error;
  if (!paypalEnabled()) return NextResponse.json({ error: "PayPal indisponible." }, { status: 400 });

  const { orderId, token } = (await request.json().catch(() => ({}))) as { orderId?: string; token?: string };
  const order = orderId
    ? await prisma.order.findFirst({
        where: { id: orderId, userId: auth.session.user.id },
        include: { payments: { where: { method: "paypal" }, orderBy: { createdAt: "desc" }, take: 1 } },
      })
    : null;
  const payment = order?.payments[0];
  if (!order || !payment) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  if (payment.status === "confirmed") return NextResponse.json({ ok: true, alreadyConfirmed: true });

  // The PayPal order id must be the one WE created for this payment (not a value supplied by the browser).
  const stored = (payment.providerPayload as { paypalOrderId?: string } | null)?.paypalOrderId;
  if (!stored || stored !== token) return NextResponse.json({ error: "Transaction invalide." }, { status: 400 });

  try {
    const result = await capturePaypalOrder(stored);
    const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
    const expected = toPaypalAmount(Number(order.total));

    if (
      result.status !== "COMPLETED" ||
      !capture ||
      capture.status !== "COMPLETED" ||
      capture.amount.currency_code !== PAYPAL_CURRENCY ||
      capture.amount.value !== expected
    ) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed", providerPayload: { paypalOrderId: stored, result: JSON.parse(JSON.stringify(result)) } } });
      return NextResponse.json({ error: "Le paiement PayPal n'a pas pu être vérifié." }, { status: 400 });
    }

    // providerTransactionId is UNIQUE: a capture can never confirm two payments (replay protection).
    const duplicate = await prisma.payment.findUnique({ where: { providerTransactionId: capture.id } });
    if (duplicate && duplicate.id !== payment.id) {
      return NextResponse.json({ error: "Transaction déjà utilisée." }, { status: 409 });
    }
    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerTransactionId: capture.id, providerPayload: { paypalOrderId: stored, captureId: capture.id } },
    });
    await confirmPayment(payment.id, null, request);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[paypal.capture]", error);
    return NextResponse.json({ error: "Vérification PayPal impossible. Contactez-nous." }, { status: 502 });
  }
}
