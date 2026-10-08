import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/doc-number";
import { computeTotals, type LineInput } from "@/lib/totals";

type Tx = Prisma.TransactionClient;

/** Convert stored decimal rows back into raw line inputs. */
export function rowsToLines(
  rows: { name: string; description: string | null; quantity: unknown; unitPrice: unknown; discountPercent: unknown; taxRate: unknown }[]
): LineInput[] {
  return rows.map((r) => ({
    name: r.name,
    description: r.description,
    quantity: Number(r.quantity),
    unitPrice: Number(r.unitPrice),
    discountPercent: Number(r.discountPercent),
    taxRate: Number(r.taxRate),
  }));
}

function lineRows(lines: LineInput[]) {
  const totals = computeTotals(lines);
  return {
    totals,
    rows: totals.lines.map((l, position) => ({
      position,
      name: l.name,
      description: l.description,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      discountPercent: l.discountPercent,
      taxRate: l.taxRate,
      lineTotal: l.lineTotal,
    })),
  };
}

export type QuoteFields = {
  userId: string;
  title: string;
  description?: string | null;
  currency?: string;
  validUntil?: Date | null;
  notes?: string | null;
  internalNotes?: string | null;
  terms?: string | null;
  quoteRequestId?: string | null;
  projectId?: string | null;
};

export async function createQuote(fields: QuoteFields, lines: LineInput[], tx?: Tx) {
  const run = async (db: Tx) => {
    const { totals, rows } = lineRows(lines);
    const reference = await nextDocumentNumber("DEV", db);
    return db.quote.create({
      data: {
        reference,
        title: fields.title,
        description: fields.description ?? null,
        currency: fields.currency ?? "DH",
        validUntil: fields.validUntil ?? null,
        notes: fields.notes ?? null,
        internalNotes: fields.internalNotes ?? null,
        terms: fields.terms ?? null,
        userId: fields.userId,
        quoteRequestId: fields.quoteRequestId ?? null,
        projectId: fields.projectId ?? null,
        amount: totals.total,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        totalHt: totals.totalHt,
        taxTotal: totals.taxTotal,
        total: totals.total,
        lines: { create: rows },
      },
    });
  };
  return tx ? run(tx) : prisma.$transaction(run);
}

export async function updateQuote(id: string, fields: Partial<QuoteFields>, lines?: LineInput[]) {
  return prisma.$transaction(async (db) => {
    const data: Prisma.QuoteUpdateInput = {};
    if (fields.title !== undefined) data.title = fields.title;
    if (fields.description !== undefined) data.description = fields.description;
    if (fields.currency !== undefined) data.currency = fields.currency;
    if (fields.validUntil !== undefined) data.validUntil = fields.validUntil;
    if (fields.notes !== undefined) data.notes = fields.notes;
    if (fields.internalNotes !== undefined) data.internalNotes = fields.internalNotes;
    if (fields.terms !== undefined) data.terms = fields.terms;

    if (lines) {
      const { totals, rows } = lineRows(lines);
      await db.quoteItem.deleteMany({ where: { quoteId: id } });
      await db.quoteItem.createMany({ data: rows.map((r) => ({ ...r, quoteId: id })) });
      Object.assign(data, {
        amount: totals.total,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        totalHt: totals.totalHt,
        taxTotal: totals.taxTotal,
        total: totals.total,
      });
    }
    return db.quote.update({ where: { id }, data });
  });
}

/** Duplicate a quote (new number, draft, same client & lines). */
export async function duplicateQuote(id: string) {
  const src = await prisma.quote.findUnique({ where: { id }, include: { lines: { orderBy: { position: "asc" } } } });
  if (!src || !src.userId) return null;
  return createQuote(
    {
      userId: src.userId,
      title: src.title,
      description: src.description,
      currency: src.currency,
      notes: src.notes,
      internalNotes: src.internalNotes,
      terms: src.terms,
      projectId: src.projectId,
    },
    rowsToLines(src.lines)
  );
}

/** Quote → Bon de commande. Idempotent: returns the existing active PO if there is one. */
export async function createPurchaseOrderFromQuote(quoteId: string) {
  return prisma.$transaction(async (db) => {
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: { lines: { orderBy: { position: "asc" } }, purchaseOrders: true },
    });
    if (!quote || !quote.userId) throw new Error("Quote not found");
    const existing = quote.purchaseOrders.find((p) => p.status !== "cancelled");
    if (existing) return { po: existing, created: false };

    const { totals, rows } = lineRows(rowsToLines(quote.lines));
    const number = await nextDocumentNumber("BC", db);
    const po = await db.purchaseOrder.create({
      data: {
        number,
        quoteId: quote.id,
        userId: quote.userId,
        currency: quote.currency,
        terms: quote.terms,
        notes: quote.notes,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        totalHt: totals.totalHt,
        taxTotal: totals.taxTotal,
        total: totals.total,
        lines: { create: rows },
      },
    });
    return { po, created: true };
  });
}

/** Invoice from a purchase order / quote / order. Copies lines and keeps the relations. */
export async function createInvoice(params: {
  userId: string;
  title: string;
  description?: string | null;
  lines: LineInput[];
  currency?: string;
  dueAt?: Date | null;
  notes?: string | null;
  terms?: string | null;
  quoteId?: string | null;
  purchaseOrderId?: string | null;
  orderId?: string | null;
  projectId?: string | null;
}) {
  return prisma.$transaction(async (db) => {
    const { totals, rows } = lineRows(params.lines);
    const reference = await nextDocumentNumber("FAC", db);
    return db.invoice.create({
      data: {
        reference,
        title: params.title,
        description: params.description ?? null,
        currency: params.currency ?? "DH",
        status: "draft",
        dueAt: params.dueAt ?? null,
        notes: params.notes ?? null,
        terms: params.terms ?? null,
        userId: params.userId,
        quoteId: params.quoteId ?? null,
        purchaseOrderId: params.purchaseOrderId ?? null,
        orderId: params.orderId ?? null,
        projectId: params.projectId ?? null,
        amount: totals.totalHt,
        taxAmount: totals.taxTotal,
        totalAmount: totals.total,
        discountTotal: totals.discountTotal,
        lines: { create: rows },
      },
    });
  });
}

export async function updateInvoice(
  id: string,
  fields: { title?: string; description?: string | null; dueAt?: Date | null; notes?: string | null; terms?: string | null },
  lines?: LineInput[]
) {
  return prisma.$transaction(async (db) => {
    const data: Prisma.InvoiceUpdateInput = { ...fields };
    if (lines) {
      const { totals, rows } = lineRows(lines);
      await db.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await db.invoiceItem.createMany({ data: rows.map((r) => ({ ...r, invoiceId: id })) });
      Object.assign(data, {
        amount: totals.totalHt,
        taxAmount: totals.taxTotal,
        totalAmount: totals.total,
        discountTotal: totals.discountTotal,
      });
    }
    return db.invoice.update({ where: { id }, data });
  });
}

/** Recompute an invoice's paid total + status from its confirmed payments. */
export async function syncInvoicePayments(invoiceId: string, db: Tx | typeof prisma = prisma) {
  const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice || invoice.status === "cancelled" || invoice.status === "draft") return invoice;

  const agg = await db.payment.aggregate({
    where: { invoiceId, status: "confirmed" },
    _sum: { amount: true },
  });
  const paid = Number(agg._sum.amount ?? 0);
  const total = Number(invoice.totalAmount);
  const cents = (n: number) => Math.round(n * 100);

  let status = invoice.status;
  if (cents(paid) >= cents(total) && total > 0) status = "paid";
  else if (paid > 0) status = "partially_paid";
  else if (invoice.dueAt && invoice.dueAt < new Date()) status = "overdue";
  else status = "unpaid";

  return db.invoice.update({
    where: { id: invoiceId },
    data: {
      paidTotal: paid,
      status,
      paidAt: status === "paid" ? invoice.paidAt ?? new Date() : null,
    },
  });
}

/** Every payment needs an order. Standalone invoices get one created from their lines. */
export async function ensureOrderForInvoice(invoiceId: string) {
  return prisma.$transaction(async (db) => {
    const inv = await db.invoice.findUnique({ where: { id: invoiceId }, include: { lines: { orderBy: { position: "asc" } } } });
    if (!inv) throw new Error("Invoice not found");
    if (inv.orderId) return inv.orderId;
    const number = await nextDocumentNumber("CMD", db);
    const order = await db.order.create({
      data: {
        number,
        userId: inv.userId,
        status: "awaiting_payment",
        currency: inv.currency,
        subtotal: Number(inv.amount) + Number(inv.discountTotal),
        discountTotal: inv.discountTotal,
        taxTotal: inv.taxAmount,
        total: inv.totalAmount,
        quoteId: inv.quoteId,
        purchaseOrderId: inv.purchaseOrderId,
        items: {
          create: inv.lines.length
            ? inv.lines.map((l) => ({
                kind: "custom",
                name: l.name,
                description: l.description,
                quantity: Math.max(1, Math.round(Number(l.quantity))),
                unitPrice: l.unitPrice,
                discount: 0,
                total: l.lineTotal,
              }))
            : [{ kind: "custom", name: inv.title, quantity: 1, unitPrice: inv.amount, discount: 0, total: inv.amount }],
        },
      },
    });
    await db.invoice.update({ where: { id: inv.id }, data: { orderId: order.id } });
    return order.id;
  });
}

/** Recompute an order's payment status from confirmed payments. */
export async function syncOrderPayment(orderId: string, db: Tx | typeof prisma = prisma) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return null;
  const agg = await db.payment.aggregate({ where: { orderId, status: "confirmed" }, _sum: { amount: true } });
  const paid = Math.round(Number(agg._sum.amount ?? 0) * 100);
  const total = Math.round(Number(order.total) * 100);
  const fullyPaid = total > 0 && paid >= total;
  const data: Prisma.OrderUpdateInput = {};
  if (fullyPaid) {
    data.paymentStatus = "confirmed";
    if (["pending", "awaiting_payment", "payment_submitted"].includes(order.status)) data.status = "payment_confirmed";
  }
  return Object.keys(data).length ? db.order.update({ where: { id: orderId }, data }) : order;
}

/** Delivery note from an order (lines copied from order items). */
export async function createDeliveryNote(orderId: string, notes?: string | null) {
  return prisma.$transaction(async (db) => {
    const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Order not found");
    const number = await nextDocumentNumber("BL", db);
    return db.deliveryNote.create({
      data: {
        number,
        orderId: order.id,
        userId: order.userId,
        notes: notes ?? null,
        lines: {
          create: order.items.map((i, position) => ({
            position,
            name: i.name,
            description: i.description,
            quantity: i.quantity,
          })),
        },
      },
    });
  });
}

/** Create an order from an accepted quote / PO (used when the client goes on to pay). */
export async function createOrderFromPurchaseOrder(purchaseOrderId: string) {
  return prisma.$transaction(async (db) => {
    const po = await db.purchaseOrder.findUnique({
      where: { id: purchaseOrderId },
      include: { lines: { orderBy: { position: "asc" } }, orders: true },
    });
    if (!po) throw new Error("Purchase order not found");
    const existing = po.orders.find((o) => o.status !== "cancelled");
    if (existing) return { order: existing, created: false };

    const number = await nextDocumentNumber("CMD", db);
    const order = await db.order.create({
      data: {
        number,
        userId: po.userId,
        status: "awaiting_payment",
        currency: po.currency,
        subtotal: po.subtotal,
        discountTotal: po.discountTotal,
        taxTotal: po.taxTotal,
        total: po.total,
        quoteId: po.quoteId,
        purchaseOrderId: po.id,
        items: {
          create: po.lines.map((l) => ({
            kind: "custom",
            name: l.name,
            description: l.description,
            quantity: Math.max(1, Math.round(Number(l.quantity))),
            unitPrice: l.unitPrice,
            discount: 0,
            total: l.lineTotal,
          })),
        },
      },
    });
    return { order, created: true };
  });
}
