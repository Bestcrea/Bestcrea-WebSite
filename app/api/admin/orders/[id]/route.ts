import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyClient } from "@/lib/notify";
import { clean } from "@/lib/validators";

// payment_confirmed / payment_submitted are driven by payments, never set by hand.
const MANUAL = ["processing", "in_progress", "completed", "cancelled"] as const;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminApi("orders.manage");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { status?: string; internalNotes?: string };
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: { status?: (typeof MANUAL)[number]; internalNotes?: string | null } = {};
  if (body.status) {
    if (!(MANUAL as readonly string[]).includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    if (["processing", "in_progress", "completed"].includes(body.status) && order.paymentStatus !== "confirmed") {
      return NextResponse.json({ error: "Le paiement doit être confirmé avant de lancer la commande." }, { status: 409 });
    }
    data.status = body.status as (typeof MANUAL)[number];
  }
  if (body.internalNotes !== undefined) data.internalNotes = clean(body.internalNotes, 4000);

  await prisma.order.update({ where: { id: order.id }, data });
  if (data.status && data.status !== order.status) {
    await notifyClient(order.userId, {
      type: "order.status",
      title: `Commande ${order.number} : ${data.status === "completed" ? "terminée" : data.status === "cancelled" ? "annulée" : "en cours"}`,
      href: `/espace-client/commandes/${order.id}`,
    });
  }
  await audit({ userId: auth.session.user.id, action: "order.updated", entity: "Order", entityId: order.id, changes: data.status ? { status: data.status } : undefined, request });
  return NextResponse.json({ ok: true });
}
