import { prisma } from "@/lib/prisma";
import { createInvoice, syncInvoicePayments, syncOrderPayment } from "@/lib/documents";
import { notifyClient } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { DEFAULT_VAT } from "@/lib/totals";

/**
 * Confirm a payment (admin verification or verified PayPal capture).
 * Idempotent: confirming an already confirmed payment does nothing.
 * Creates the paid invoice for the order if there is none yet.
 */
export async function confirmPayment(paymentId: string, actorId: string | null, request?: Request) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { items: true, user: { select: { id: true } } } } },
  });
  if (!payment) throw new Error("Payment not found");
  if (payment.status === "confirmed") return payment;

  const order = payment.order;
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "confirmed", confirmedAt: new Date(), confirmedById: actorId },
  });

  // Invoice (one per order): created already paid, from the order snapshot.
  let invoice = await prisma.invoice.findFirst({ where: { orderId: order.id, status: { not: "cancelled" } } });
  if (!invoice) {
    const subtotal = Number(order.subtotal);
    const discountPct = subtotal > 0 ? (Number(order.discountTotal) / subtotal) * 100 : 0;
    const created = await createInvoice({
      userId: order.userId,
      title: `Commande ${order.number}`,
      currency: order.currency,
      orderId: order.id,
      quoteId: order.quoteId,
      purchaseOrderId: order.purchaseOrderId,
      lines: order.items.map((i) => ({
        name: i.name,
        description: i.description,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discountPercent: discountPct,
        taxRate: DEFAULT_VAT,
      })),
    });
    // Keep the invoice totals identical to what the customer actually paid.
    invoice = await prisma.invoice.update({
      where: { id: created.id },
      data: {
        amount: Number(order.subtotal) - Number(order.discountTotal),
        taxAmount: order.taxTotal,
        totalAmount: order.total,
        discountTotal: order.discountTotal,
        status: "unpaid",
        issuedAt: new Date(),
        sentAt: new Date(),
      },
    });
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { invoiceId: invoice.id } });
  await syncInvoicePayments(invoice.id);
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { paymentMethod: payment.method, paymentReference: payment.reference ?? payment.providerTransactionId },
  });
  await syncOrderPayment(order.id);

  await notifyClient(order.userId, {
    type: "payment.confirmed",
    title: `Paiement confirmé — commande ${order.number}`,
    body: "Merci ! Votre facture est disponible dans votre espace client.",
    href: "/espace-client/commandes",
  });
  await audit({ userId: actorId, action: "payment.confirmed", entity: "Payment", entityId: payment.id, request });
  return prisma.payment.findUnique({ where: { id: payment.id } });
}
