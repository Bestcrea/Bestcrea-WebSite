import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApi } from "@/lib/client-api";

type Ctx = { params: Promise<{ id: string }> };

/** A client may cancel their own unpaid order. Soft-cancel: accounting history is never hard-deleted. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireClientApi();
  if ("error" in guard) return guard.error;

  const order = await prisma.order.findFirst({ where: { id, userId: guard.session.user.id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!["pending", "awaiting_payment"].includes(order.status) || order.paymentStatus === "confirmed") {
    return NextResponse.json({ error: "NOT_CANCELLABLE" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status: "cancelled" } }),
    prisma.payment.updateMany({ where: { orderId: id, status: "pending" }, data: { status: "failed" } }),
  ]);
  return NextResponse.json({ ok: true });
}
