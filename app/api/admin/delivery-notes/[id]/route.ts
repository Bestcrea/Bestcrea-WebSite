import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyClient } from "@/lib/notify";
import { clean } from "@/lib/validators";

type Params = { params: { id: string } };

const ACTIONS = ["send", "deliver", "cancel", "update"] as const;

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi("delivery_notes.edit");
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => ({}))) as { action?: string; notes?: string };
  const action = body.action as (typeof ACTIONS)[number];
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const bl = await prisma.deliveryNote.findUnique({ where: { id: params.id } });
  if (!bl) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (bl.status === "cancelled") return NextResponse.json({ error: "Cancelled" }, { status: 409 });

  const log = (a: string) =>
    audit({ userId: auth.session.user.id, action: `delivery_note.${a}`, entity: "DeliveryNote", entityId: bl.id, request });

  if (action === "update") {
    await prisma.deliveryNote.update({ where: { id: bl.id }, data: { notes: clean(body.notes, 2000) } });
    await log("updated");
  } else if (action === "send") {
    await prisma.deliveryNote.update({ where: { id: bl.id }, data: { status: bl.status === "draft" ? "sent" : bl.status, sentAt: new Date() } });
    await notifyClient(bl.userId, {
      type: "delivery_note.sent",
      title: `Bon de livraison ${bl.number}`,
      href: `/espace-client/bons-de-livraison`,
    });
    await log("sent");
  } else if (action === "deliver") {
    await prisma.deliveryNote.update({ where: { id: bl.id }, data: { status: "delivered", deliveredAt: new Date(), sentAt: bl.sentAt ?? new Date() } });
    await notifyClient(bl.userId, {
      type: "delivery_note.delivered",
      title: `Livraison confirmée — ${bl.number}`,
      href: `/espace-client/bons-de-livraison`,
    });
    await log("delivered");
  } else {
    await prisma.deliveryNote.update({ where: { id: bl.id }, data: { status: "cancelled" } });
    await log("cancelled");
  }
  return NextResponse.json({ ok: true });
}
