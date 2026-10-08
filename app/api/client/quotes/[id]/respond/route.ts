import { NextRequest, NextResponse } from "next/server";
import { requireClientApi } from "@/lib/client-api";
import { prisma } from "@/lib/prisma";
import { clean } from "@/lib/validators";
import { notifyStaff } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { createPurchaseOrderFromQuote } from "@/lib/documents";

type Params = { params: { id: string } };

const ACTIONS = ["accept", "reject", "modify"] as const;

/** The client accepts, rejects or asks for changes on one of THEIR quotes. */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireClientApi();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const body = (await request.json().catch(() => ({}))) as { action?: string; message?: string };
  const action = body.action as (typeof ACTIONS)[number];
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  // Ownership is part of the query: another client's quote id simply returns 404.
  const quote = await prisma.quote.findFirst({ where: { id: params.id, userId } });
  if (!quote || quote.status === "draft") return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!["sent", "viewed", "pending"].includes(quote.status)) {
    return NextResponse.json({ error: `This quote is ${quote.status} and can no longer be answered` }, { status: 409 });
  }
  if (quote.validUntil && quote.validUntil < new Date() && action === "accept") {
    await prisma.quote.update({ where: { id: quote.id }, data: { status: "expired" } });
    return NextResponse.json({ error: "This quote has expired. Please contact us for an updated one." }, { status: 409 });
  }

  const message = clean(body.message, 2000);
  const who = auth.session.user.name || auth.session.user.email || "Client";
  const log = (a: string) => audit({ userId, action: `quote.${a}`, entity: "Quote", entityId: quote.id, request });

  if (action === "accept") {
    await prisma.quote.update({ where: { id: quote.id }, data: { status: "accepted", respondedAt: new Date() } });
    // Accepting a quote creates the Bon de commande automatically (idempotent) so nothing is lost.
    const { po } = await createPurchaseOrderFromQuote(quote.id);
    await notifyStaff({
      type: "quote.accepted",
      title: `Devis ${quote.reference} accepté`,
      body: `${who} a accepté le devis. Bon de commande ${po.number} créé.`,
      href: `/admin/devis/${quote.id}`,
    });
    await log("accepted");
    return NextResponse.json({ ok: true, purchaseOrderNumber: po.number });
  }

  if (action === "reject") {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: "rejected", respondedAt: new Date(), rejectionReason: message },
    });
    await notifyStaff({ type: "quote.rejected", title: `Devis ${quote.reference} refusé`, body: `${who}${message ? ` : ${message}` : ""}`, href: `/admin/devis/${quote.id}` });
    await log("rejected");
    return NextResponse.json({ ok: true });
  }

  if (!message) return NextResponse.json({ error: "Please describe the changes you need" }, { status: 400 });
  await prisma.quote.update({
    where: { id: quote.id },
    data: { status: "pending", modificationRequest: message },
  });
  await notifyStaff({ type: "quote.modification", title: `Modification demandée — ${quote.reference}`, body: `${who} : ${message}`, href: `/admin/devis/${quote.id}` });
  await log("modification_requested");
  return NextResponse.json({ ok: true });
}
