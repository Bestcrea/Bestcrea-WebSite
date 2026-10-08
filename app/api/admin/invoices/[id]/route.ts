import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { updateInvoice } from "@/lib/documents";
import { parseCommon, parseDate } from "@/lib/doc-input";

type Params = { params: { id: string } };

/** Invoices are editable only while no payment has been recorded and they are not cancelled. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi("invoices.edit");
  if (auth.error) return auth.error;

  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status === "cancelled" || invoice.status === "paid" || Number(invoice.paidTotal) > 0) {
    return NextResponse.json({ error: "This invoice can no longer be edited" }, { status: 409 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const common = parseCommon(body, false);
  if ("error" in common) return NextResponse.json({ error: common.error }, { status: 400 });
  const c = common.value;
  const dueAt = parseDate(body.dueAt);
  if (dueAt === undefined && body.dueAt !== undefined) return NextResponse.json({ error: "Invalid dueAt" }, { status: 400 });
  if ("title" in c && !c.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  await updateInvoice(
    params.id,
    {
      ...(c.title ? { title: c.title } : {}),
      ...("description" in c ? { description: c.description } : {}),
      ...("notes" in c ? { notes: c.notes } : {}),
      ...("terms" in c ? { terms: c.terms } : {}),
      ...(dueAt !== undefined ? { dueAt } : {}),
    },
    c.lines
  );
  await audit({ userId: auth.session.user.id, action: "invoice.updated", entity: "Invoice", entityId: params.id, request });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi("invoices.delete");
  if (auth.error) return auth.error;
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status !== "draft") {
    return NextResponse.json({ error: "Only drafts can be deleted. Cancel the invoice instead." }, { status: 409 });
  }
  await prisma.invoice.delete({ where: { id: params.id } });
  await audit({ userId: auth.session.user.id, action: "invoice.deleted", entity: "Invoice", entityId: params.id, changes: { reference: invoice.reference }, request });
  return NextResponse.json({ ok: true });
}
