import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { createQuote } from "@/lib/documents";
import { parseCommon, parseDate } from "@/lib/doc-input";
import { notifyClient } from "@/lib/notify";

/** Create a quote (draft) for a client, optionally linked to a quote request. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi("quotes.create");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const userId = typeof body.userId === "string" ? body.userId : "";
  const client = userId ? await prisma.user.findFirst({ where: { id: userId, role: "client" }, select: { id: true } }) : null;
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });

  const common = parseCommon(body, true);
  if ("error" in common) return NextResponse.json({ error: common.error }, { status: 400 });
  const c = common.value;
  if (!c.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const validUntil = parseDate(body.validUntil);
  if (validUntil === undefined && body.validUntil !== undefined) {
    return NextResponse.json({ error: "Invalid validUntil" }, { status: 400 });
  }

  let quoteRequestId: string | null = null;
  if (typeof body.quoteRequestId === "string" && body.quoteRequestId) {
    const qr = await prisma.quoteRequest.findFirst({ where: { id: body.quoteRequestId, userId } });
    if (!qr) return NextResponse.json({ error: "Quote request not found for this client" }, { status: 400 });
    quoteRequestId = qr.id;
  }

  const quote = await createQuote(
    {
      userId,
      title: c.title,
      description: c.description,
      currency: c.currency,
      validUntil: validUntil ?? null,
      notes: c.notes,
      internalNotes: c.internalNotes,
      terms: c.terms,
      quoteRequestId,
    },
    c.lines!
  );

  if (quoteRequestId) {
    await prisma.quoteRequest.update({ where: { id: quoteRequestId }, data: { status: "quoted" } });
  }

  await audit({ userId: auth.session.user.id, action: "quote.created", entity: "Quote", entityId: quote.id, request });
  void notifyClient; // notification is sent when the quote is actually sent, not on draft creation

  return NextResponse.json({ ok: true, quote: { id: quote.id, reference: quote.reference } }, { status: 201 });
}
