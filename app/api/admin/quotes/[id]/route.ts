import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { updateQuote } from "@/lib/documents";
import { parseCommon, parseDate } from "@/lib/doc-input";

type Params = { params: Promise<{ id: string }> };

/** Edit a quote. Accepted quotes are locked (they are the basis of a purchase order). */
export async function PATCH(request: NextRequest, props: Params) {
  const params = await props.params;
  const auth = await requireAdminApi("quotes.edit");
  if (auth.error) return auth.error;

  const quote = await prisma.quote.findUnique({ where: { id: params.id } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quote.status === "accepted") {
    return NextResponse.json({ error: "An accepted quote cannot be edited. Duplicate it instead." }, { status: 409 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const common = parseCommon(body, false);
  if ("error" in common) return NextResponse.json({ error: common.error }, { status: 400 });
  const c = common.value;

  const validUntil = parseDate(body.validUntil);
  if (validUntil === undefined && body.validUntil !== undefined) {
    return NextResponse.json({ error: "Invalid validUntil" }, { status: 400 });
  }
  if ("title" in c && !c.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  await updateQuote(
    params.id,
    {
      ...(c.title ? { title: c.title } : {}),
      ...("description" in c ? { description: c.description } : {}),
      ...("currency" in c ? { currency: c.currency } : {}),
      ...("notes" in c ? { notes: c.notes } : {}),
      ...("terms" in c ? { terms: c.terms } : {}),
      ...("internalNotes" in c ? { internalNotes: c.internalNotes } : {}),
      ...(validUntil !== undefined ? { validUntil } : {}),
    },
    c.lines
  );

  await audit({ userId: auth.session.user.id, action: "quote.updated", entity: "Quote", entityId: params.id, request });
  return NextResponse.json({ ok: true });
}

/** Only drafts may be deleted; anything already sent is cancelled instead (kept for the records). */
export async function DELETE(request: NextRequest, props: Params) {
  const params = await props.params;
  const auth = await requireAdminApi("quotes.delete");
  if (auth.error) return auth.error;

  const quote = await prisma.quote.findUnique({ where: { id: params.id }, include: { _count: { select: { purchaseOrders: true, orders: true, invoices: true } } } });
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quote.status !== "draft" || quote._count.purchaseOrders + quote._count.orders + quote._count.invoices > 0) {
    return NextResponse.json({ error: "Only unused drafts can be deleted. Cancel the quote instead." }, { status: 409 });
  }
  await prisma.quote.delete({ where: { id: params.id } });
  await audit({ userId: auth.session.user.id, action: "quote.deleted", entity: "Quote", entityId: params.id, changes: { reference: quote.reference }, request });
  return NextResponse.json({ ok: true });
}
