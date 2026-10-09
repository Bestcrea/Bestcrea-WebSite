import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { clean } from "@/lib/validators";
import { notifyClient } from "@/lib/notify";

const STATUSES = ["new", "in_review", "quoted", "closed", "cancelled"] as const;

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await requireAdminApi("quotes.edit");
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => ({}))) as { status?: string; internalNotes?: string };

  const existing = await prisma.quoteRequest.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.status && !(STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.quoteRequest.update({
    where: { id: params.id },
    data: {
      ...(body.status ? { status: body.status as (typeof STATUSES)[number] } : {}),
      ...(body.internalNotes !== undefined ? { internalNotes: clean(body.internalNotes, 4000) } : {}),
    },
  });
  if (body.status && body.status !== existing.status) {
    await notifyClient(existing.userId, {
      type: "quote_request.status",
      title: `Votre demande ${existing.number} a été mise à jour`,
      href: "/espace-client/devis",
    });
  }
  await audit({ userId: auth.session.user.id, action: "quote_request.updated", entity: "QuoteRequest", entityId: params.id, request });
  return NextResponse.json({ ok: true });
}
