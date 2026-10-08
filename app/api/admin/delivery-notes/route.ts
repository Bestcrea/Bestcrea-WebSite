import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { createDeliveryNote } from "@/lib/documents";
import { clean } from "@/lib/validators";

/** Create a delivery note for an order. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi("delivery_notes.create");
  if (auth.error) return auth.error;
  const body = (await request.json().catch(() => ({}))) as { orderId?: string; notes?: string };
  if (!body.orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  const order = await prisma.order.findUnique({ where: { id: body.orderId }, select: { id: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const bl = await createDeliveryNote(order.id, clean(body.notes, 2000));
  await audit({ userId: auth.session.user.id, action: "delivery_note.created", entity: "DeliveryNote", entityId: bl.id, request });
  return NextResponse.json({ ok: true, deliveryNote: { id: bl.id, number: bl.number } }, { status: 201 });
}
