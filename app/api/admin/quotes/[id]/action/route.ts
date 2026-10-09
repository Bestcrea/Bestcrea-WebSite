import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyClient } from "@/lib/notify";
import { sendMail } from "@/lib/mailer";
import { createPurchaseOrderFromQuote, duplicateQuote } from "@/lib/documents";
import { roleCan } from "@/lib/permissions";

type Params = { params: Promise<{ id: string }> };

const ACTIONS = ["send", "duplicate", "cancel", "expire", "create_purchase_order", "mark_pending"] as const;

export async function POST(request: NextRequest, props: Params) {
  const params = await props.params;
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  const action = body.action as (typeof ACTIONS)[number];
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const needed =
    action === "send" ? "quotes.send"
    : action === "duplicate" ? "quotes.create"
    : action === "create_purchase_order" ? "purchase_orders.create"
    : "quotes.edit";
  const auth = await requireAdminApi(needed);
  if (auth.error) return auth.error;

  const quote = await prisma.quote.findUnique({ where: { id: params.id }, include: { user: { select: { id: true, email: true, name: true } } } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const actor = auth.session.user.id;
  const log = (a: string, extra?: Record<string, string>) =>
    audit({ userId: actor, action: `quote.${a}`, entity: "Quote", entityId: quote.id, changes: extra, request });

  switch (action) {
    case "send": {
      if (!quote.user) return NextResponse.json({ error: "Quote has no client" }, { status: 400 });
      if (["accepted", "cancelled"].includes(quote.status)) {
        return NextResponse.json({ error: `Cannot send a ${quote.status} quote` }, { status: 409 });
      }
      if (Number(quote.total) <= 0) return NextResponse.json({ error: "Quote total must be greater than 0" }, { status: 400 });
      await prisma.quote.update({ where: { id: quote.id }, data: { status: "sent", sentAt: new Date() } });
      await notifyClient(quote.user.id, {
        type: "quote.sent",
        title: `Nouveau devis ${quote.reference}`,
        body: quote.title,
        href: `/espace-client/devis/${quote.id}`,
      });
      await sendMail({
        to: quote.user.email,
        subject: `Votre devis ${quote.reference} - Bestcrea`,
        text: `Bonjour ${quote.user.name ?? ""},\n\nVotre devis ${quote.reference} (${quote.title}) est disponible dans votre espace client Bestcrea.\n\nCordialement,\nBestcrea`,
      }).catch((e) => console.error("[quote.send mail]", e));
      await log("sent");
      return NextResponse.json({ ok: true });
    }
    case "mark_pending": {
      await prisma.quote.update({ where: { id: quote.id }, data: { status: "pending" } });
      await log("pending");
      return NextResponse.json({ ok: true });
    }
    case "cancel": {
      if (quote.status === "accepted" && !(await roleCan(auth.session.user.role, "quotes.delete"))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await prisma.quote.update({ where: { id: quote.id }, data: { status: "cancelled" } });
      if (quote.user) {
        await notifyClient(quote.user.id, { type: "quote.cancelled", title: `Devis ${quote.reference} annulé`, href: `/espace-client/devis/${quote.id}` });
      }
      await log("cancelled");
      return NextResponse.json({ ok: true });
    }
    case "expire": {
      await prisma.quote.update({ where: { id: quote.id }, data: { status: "expired" } });
      await log("expired");
      return NextResponse.json({ ok: true });
    }
    case "duplicate": {
      const copy = await duplicateQuote(quote.id);
      if (!copy) return NextResponse.json({ error: "Cannot duplicate" }, { status: 400 });
      await log("duplicated", { copy: copy.reference });
      return NextResponse.json({ ok: true, quote: { id: copy.id, reference: copy.reference } });
    }
    case "create_purchase_order": {
      if (quote.status !== "accepted") {
        return NextResponse.json({ error: "Only an accepted quote can become a purchase order" }, { status: 409 });
      }
      const { po, created } = await createPurchaseOrderFromQuote(quote.id);
      if (created) await log("purchase_order_created", { number: po.number });
      return NextResponse.json({ ok: true, purchaseOrder: { id: po.id, number: po.number }, created });
    }
  }
}
