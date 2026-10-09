import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyClient } from "@/lib/notify";
import { clean } from "@/lib/validators";
import { confirmPayment } from "@/lib/payments";

/** Verify a payment: confirm (creates the paid invoice) or reject. */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await requireAdminApi("payments.verify");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { action?: string; note?: string };
  const payment = await prisma.payment.findUnique({ where: { id: params.id }, include: { order: true } });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = auth.session.user.id;

  if (body.action === "confirm") {
    if (payment.status === "confirmed") return NextResponse.json({ ok: true, alreadyConfirmed: true });
    if (payment.method === "paypal" && !payment.providerTransactionId) {
      return NextResponse.json({ error: "Un paiement PayPal ne peut être confirmé que par la vérification PayPal." }, { status: 409 });
    }
    await confirmPayment(payment.id, actor, request);
    return NextResponse.json({ ok: true });
  }

  if (body.action === "reject") {
    if (payment.status === "confirmed") return NextResponse.json({ error: "Paiement déjà confirmé." }, { status: 409 });
    const note = clean(body.note, 500);
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "failed", notes: note } }),
      prisma.order.update({ where: { id: payment.orderId }, data: { status: "awaiting_payment", paymentStatus: "failed" } }),
    ]);
    await notifyClient(payment.order.userId, {
      type: "payment.rejected",
      title: `Paiement non validé — ${payment.order.number}`,
      body: note ?? "Veuillez vérifier votre paiement et renvoyer un justificatif.",
      href: `/espace-client/commandes/${payment.orderId}`,
    });
    await audit({ userId: actor, action: "payment.rejected", entity: "Payment", entityId: payment.id, changes: note ? { note } : undefined, request });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
