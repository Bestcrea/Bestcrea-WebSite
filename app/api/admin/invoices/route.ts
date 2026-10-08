import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { createInvoice } from "@/lib/documents";
import { parseCommon, parseDate } from "@/lib/doc-input";

/** Create a standalone invoice (draft) for a client. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi("invoices.create");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const userId = typeof body.userId === "string" ? body.userId : "";
  const client = userId ? await prisma.user.findFirst({ where: { id: userId, role: "client" }, select: { id: true } }) : null;
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 400 });

  const common = parseCommon(body, true);
  if ("error" in common) return NextResponse.json({ error: common.error }, { status: 400 });
  const c = common.value;
  if (!c.title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const dueAt = parseDate(body.dueAt);
  if (dueAt === undefined && body.dueAt !== undefined) return NextResponse.json({ error: "Invalid dueAt" }, { status: 400 });

  const invoice = await createInvoice({
    userId,
    title: c.title,
    description: c.description,
    lines: c.lines!,
    currency: c.currency,
    dueAt: dueAt ?? null,
    notes: c.notes,
    terms: c.terms,
  });

  await audit({ userId: auth.session.user.id, action: "invoice.created", entity: "Invoice", entityId: invoice.id, request });
  return NextResponse.json({ ok: true, invoice: { id: invoice.id, reference: invoice.reference } }, { status: 201 });
}
