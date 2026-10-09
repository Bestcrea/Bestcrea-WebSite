import { NextRequest, NextResponse } from "next/server";
import { requireClientApi } from "@/lib/client-api";
import { prisma } from "@/lib/prisma";
import { saveProof } from "@/lib/proof-storage";
import { rateLimit } from "@/lib/rate-limit";
import { clean } from "@/lib/validators";
import { notifyStaff } from "@/lib/notify";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/** Client submits proof of payment (+ optional reference) for THEIR order. */
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await requireClientApi();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  if (!rateLimit(`proof:${userId}`, 15, 60 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
  }

  const order = await prisma.order.findFirst({
    where: { id: params.id, userId },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const payment = order?.payments[0];
  if (!order || !payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.status === "confirmed" || order.status === "cancelled") {
    return NextResponse.json({ error: "Cette commande n'accepte plus de justificatif." }, { status: 409 });
  }
  if (payment.method === "paypal") return NextResponse.json({ error: "Not applicable" }, { status: 400 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("proof");
  const reference = clean(form?.get("reference"), 120);
  if (!(file instanceof File) && !reference) {
    return NextResponse.json({ error: "Ajoutez un justificatif ou une référence de paiement." }, { status: 400 });
  }

  let proofPath = payment.proofPath;
  let proofName = payment.proofName;
  if (file instanceof File && file.size > 0) {
    const saved = await saveProof(file);
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 400 });
    proofPath = saved.key;
    proofName = saved.name;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { proofPath, proofName, reference: reference ?? payment.reference, status: "submitted" },
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: "payment_submitted", paymentStatus: "submitted" } }),
  ]);

  await notifyStaff({
    type: "payment.submitted",
    title: `Paiement à vérifier — ${order.number}`,
    body: reference ? `Référence : ${reference}` : "Justificatif envoyé",
    href: `/admin/commandes/${order.id}`,
  });
  await audit({ userId, action: "payment.proof_submitted", entity: "Payment", entityId: payment.id, request });
  return NextResponse.json({ ok: true });
}
