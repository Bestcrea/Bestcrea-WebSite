import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyClient } from "@/lib/notify";
import { sendMail } from "@/lib/mailer";
import { createInvoice, ensureOrderForInvoice, rowsToLines, syncInvoicePayments, syncOrderPayment } from "@/lib/documents";
import { clean } from "@/lib/validators";
import { parseDate } from "@/lib/doc-input";
import { PaymentMethod } from "@prisma/client";

type Params = { params: { id: string } };

const ACTIONS = ["send", "cancel", "duplicate", "record_payment", "mark_paid"] as const;

export async function POST(request: NextRequest, { params }: Params) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = body.action as (typeof ACTIONS)[number];
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const needed =
    action === "record_payment" || action === "mark_paid" ? "invoices.record_payment"
    : action === "duplicate" ? "invoices.create"
    : "invoices.edit";
  const auth = await requireAdminApi(needed);
  if (auth.error) return auth.error;

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, email: true, name: true } }, lines: { orderBy: { position: "asc" } } },
  });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = auth.session.user.id;
  const log = (a: string, extra?: Record<string, string>) =>
    audit({ userId: actor, action: `invoice.${a}`, entity: "Invoice", entityId: invoice.id, changes: extra, request });

  switch (action) {
    case "send": {
      if (invoice.status === "cancelled" || invoice.status === "paid") {
        return NextResponse.json({ error: `Cannot send a ${invoice.status} invoice` }, { status: 409 });
      }
      const now = new Date();
      const nextStatus = invoice.status === "draft" ? "unpaid" : invoice.status;
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: nextStatus, sentAt: now, issuedAt: invoice.issuedAt ?? now },
      });
      await notifyClient(invoice.user.id, {
        type: "invoice.sent",
        title: `Nouvelle facture ${invoice.reference}`,
        body: `${Number(invoice.totalAmount).toFixed(2)} ${invoice.currency}`,
        href: `/espace-client/factures`,
      });
      await sendMail({
        to: invoice.user.email,
        subject: `Facture ${invoice.reference} - Bestcrea`,
        text: `Bonjour ${invoice.user.name ?? ""},\n\nVotre facture ${invoice.reference} est disponible dans votre espace client Bestcrea.\n\nCordialement,\nBestcrea`,
      }).catch((e) => console.error("[invoice.send mail]", e));
      await log("sent");
      return NextResponse.json({ ok: true });
    }
    case "cancel": {
      if (Number(invoice.paidTotal) > 0) {
        return NextResponse.json({ error: "An invoice with recorded payments cannot be cancelled" }, { status: 409 });
      }
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "cancelled" } });
      await log("cancelled");
      return NextResponse.json({ ok: true });
    }
    case "duplicate": {
      const copy = await createInvoice({
        userId: invoice.userId,
        title: invoice.title,
        description: invoice.description,
        lines: rowsToLines(invoice.lines),
        currency: invoice.currency,
        notes: invoice.notes,
        terms: invoice.terms,
        projectId: invoice.projectId,
      });
      await log("duplicated", { copy: copy.reference });
      return NextResponse.json({ ok: true, invoice: { id: copy.id, reference: copy.reference } });
    }
    case "record_payment":
    case "mark_paid": {
      if (invoice.status === "cancelled" || invoice.status === "draft") {
        return NextResponse.json({ error: "Send the invoice before recording a payment" }, { status: 409 });
      }
      const remaining = Math.round((Number(invoice.totalAmount) - Number(invoice.paidTotal)) * 100) / 100;
      if (remaining <= 0) return NextResponse.json({ error: "Invoice already fully paid" }, { status: 409 });

      const amount = action === "mark_paid" ? remaining : Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0 || amount > remaining + 0.001) {
        return NextResponse.json({ error: `Amount must be between 0 and ${remaining}` }, { status: 400 });
      }
      const method = body.method as PaymentMethod;
      if (!Object.values(PaymentMethod).includes(method)) {
        return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
      }
      const reference = clean(body.reference, 120);
      const paidOn = parseDate(body.paidOn) ?? new Date();

      const orderId = invoice.orderId ?? (await ensureOrderForInvoice(invoice.id));
      await prisma.payment.create({
        data: {
          orderId,
          invoiceId: invoice.id,
          method,
          status: "confirmed",
          amount,
          currency: invoice.currency,
          reference,
          notes: clean(body.notes, 500),
          confirmedById: actor,
          confirmedAt: paidOn,
        },
      });
      const updated = await syncInvoicePayments(invoice.id);
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { paymentMethod: method, paymentReference: reference ?? invoice.paymentReference },
      });
      await syncOrderPayment(orderId);
      await notifyClient(invoice.user.id, {
        type: "payment.confirmed",
        title: `Paiement reçu — ${invoice.reference}`,
        body: `${amount.toFixed(2)} ${invoice.currency}`,
        href: `/espace-client/factures`,
      });
      await log("payment_recorded", { amount: String(amount), method });
      return NextResponse.json({ ok: true, status: updated?.status });
    }
  }
}
