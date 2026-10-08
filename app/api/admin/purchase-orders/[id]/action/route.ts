import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyClient } from "@/lib/notify";
import { createInvoice, createOrderFromPurchaseOrder, rowsToLines } from "@/lib/documents";

type Params = { params: { id: string } };

const ACTIONS = ["send", "confirm", "cancel", "create_order", "create_invoice"] as const;

export async function POST(request: NextRequest, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  const action = body.action as (typeof ACTIONS)[number];
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const needed =
    action === "create_order" ? "orders.manage"
    : action === "create_invoice" ? "invoices.create"
    : "purchase_orders.edit";
  const auth = await requireAdminApi(needed);
  if (auth.error) return auth.error;

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { position: "asc" } }, quote: { select: { title: true, id: true } } },
  });
  if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = auth.session.user.id;
  const log = (a: string, extra?: Record<string, string>) =>
    audit({ userId: actor, action: `purchase_order.${a}`, entity: "PurchaseOrder", entityId: po.id, changes: extra, request });

  switch (action) {
    case "send": {
      if (po.status === "cancelled") return NextResponse.json({ error: "Cancelled" }, { status: 409 });
      await prisma.purchaseOrder.update({ where: { id: po.id }, data: { status: po.status === "draft" ? "sent" : po.status, sentAt: new Date() } });
      await notifyClient(po.userId, {
        type: "purchase_order.sent",
        title: `Bon de commande ${po.number}`,
        body: po.quote?.title,
        href: `/espace-client/bons-de-commande`,
      });
      await log("sent");
      return NextResponse.json({ ok: true });
    }
    case "confirm": {
      await prisma.purchaseOrder.update({ where: { id: po.id }, data: { status: "confirmed" } });
      await log("confirmed");
      return NextResponse.json({ ok: true });
    }
    case "cancel": {
      await prisma.purchaseOrder.update({ where: { id: po.id }, data: { status: "cancelled" } });
      await log("cancelled");
      return NextResponse.json({ ok: true });
    }
    case "create_order": {
      if (po.status === "cancelled") return NextResponse.json({ error: "Cancelled" }, { status: 409 });
      const { order, created } = await createOrderFromPurchaseOrder(po.id);
      if (created) {
        await prisma.purchaseOrder.update({ where: { id: po.id }, data: { status: "confirmed" } });
        await notifyClient(po.userId, {
          type: "order.created",
          title: `Commande ${order.number} créée`,
          body: "Procédez au paiement pour lancer votre projet.",
          href: `/espace-client/commandes`,
        });
        await log("order_created", { order: order.number });
      }
      return NextResponse.json({ ok: true, order: { id: order.id, number: order.number }, created });
    }
    case "create_invoice": {
      if (po.status === "cancelled") return NextResponse.json({ error: "Cancelled" }, { status: 409 });
      const existing = await prisma.invoice.findFirst({ where: { purchaseOrderId: po.id, status: { not: "cancelled" } } });
      if (existing) return NextResponse.json({ ok: true, invoice: { id: existing.id, reference: existing.reference }, created: false });

      const { order } = await createOrderFromPurchaseOrder(po.id);
      const due = new Date();
      due.setDate(due.getDate() + 15);
      const invoice = await createInvoice({
        userId: po.userId,
        title: po.quote?.title ?? `Facture ${po.number}`,
        lines: rowsToLines(po.lines),
        currency: po.currency,
        dueAt: due,
        terms: po.terms,
        notes: po.notes,
        quoteId: po.quoteId,
        purchaseOrderId: po.id,
        orderId: order.id,
      });
      await log("invoice_created", { invoice: invoice.reference });
      await audit({ userId: actor, action: "invoice.created", entity: "Invoice", entityId: invoice.id, request });
      return NextResponse.json({ ok: true, invoice: { id: invoice.id, reference: invoice.reference }, created: true });
    }
  }
}
