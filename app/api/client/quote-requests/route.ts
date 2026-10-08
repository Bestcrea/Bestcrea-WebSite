import { NextRequest, NextResponse } from "next/server";
import { requireClientApi } from "@/lib/client-api";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/doc-number";
import { clean } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { notifyStaff } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { parseDate } from "@/lib/doc-input";

/** A signed-in client asks for a quote (Demande de devis). */
export async function POST(request: NextRequest) {
  const auth = await requireClientApi();
  if (auth.error) return auth.error;
  const userId = auth.session.user.id;

  const limited = rateLimit(`quote-request:${userId}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = clean(body.title, 200);
  const description = clean(body.description, 5000);
  if (!title || !description) {
    return NextResponse.json({ error: "title and description are required" }, { status: 400 });
  }

  let serviceId: string | null = null;
  if (typeof body.serviceId === "string" && body.serviceId) {
    const service = await prisma.service.findUnique({ where: { id: body.serviceId }, select: { id: true } });
    if (!service) return NextResponse.json({ error: "Unknown service" }, { status: 400 });
    serviceId = service.id;
  }

  const quantity = body.quantity === undefined || body.quantity === "" ? null : Number(body.quantity);
  if (quantity !== null && (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000)) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }
  const desiredDeadline = parseDate(body.desiredDeadline);
  if (desiredDeadline === undefined && body.desiredDeadline !== undefined) {
    return NextResponse.json({ error: "Invalid deadline" }, { status: 400 });
  }

  const created = await prisma.$transaction(async (tx) => {
    const number = await nextDocumentNumber("DD", tx);
    return tx.quoteRequest.create({
      data: {
        number,
        userId,
        serviceId,
        title,
        description,
        quantity,
        requirements: clean(body.requirements, 5000),
        budget: clean(body.budget, 60),
        desiredDeadline: desiredDeadline ?? null,
        notes: clean(body.notes, 3000),
      },
    });
  });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  await notifyStaff({
    type: "quote_request.created",
    title: `Nouvelle demande de devis ${created.number}`,
    body: `${user?.name || user?.email} — ${title}`,
    href: `/admin/devis/demandes/${created.id}`,
  });
  await audit({ userId, action: "quote_request.created", entity: "QuoteRequest", entityId: created.id, request });

  return NextResponse.json({ ok: true, request: { id: created.id, number: created.number } }, { status: 201 });
}
