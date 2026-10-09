import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { EMAIL_RE, clean, isLegalStatus, normalizeIce } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

type PatchBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  company?: string | null;
  ice?: string | null;
  rc?: string | null;
  legalStatus?: string | null;
  /** "activate" | "suspend" */
  action?: "activate" | "suspend";
};

async function findClient(id: string) {
  return prisma.user.findFirst({ where: { id, role: "client" } });
}

export async function PATCH(request: NextRequest, props: Params) {
  const params = await props.params;
  const body = (await request.json().catch(() => ({}))) as PatchBody;
  const isStatusAction = body.action === "activate" || body.action === "suspend";

  const auth = await requireAdminApi(isStatusAction ? "clients.suspend" : "clients.edit");
  if (auth.error) return auth.error;

  const client = await findClient(params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isStatusAction) {
    const accountStatus = body.action === "suspend" ? "suspended" : "active";
    await prisma.user.update({ where: { id: client.id }, data: { accountStatus } });
    await audit({
      userId: auth.session.user.id,
      action: body.action === "suspend" ? "client.suspended" : "client.activated",
      entity: "User",
      entityId: client.id,
      request,
    });
    return NextResponse.json({ ok: true, accountStatus });
  }

  if (body.legalStatus && !isLegalStatus(body.legalStatus)) {
    return NextResponse.json({ error: "invalid legalStatus" }, { status: 400 });
  }
  const ice = normalizeIce(body.ice);
  if (!ice.valid) {
    return NextResponse.json({ error: "ICE must contain 15 digits" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.firstName !== undefined) data.firstName = clean(body.firstName, 80);
  if (body.lastName !== undefined) data.lastName = clean(body.lastName, 80);
  if (body.email !== undefined) {
    const email = clean(body.email, 190)?.toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
    if (email !== client.email && (await prisma.user.findUnique({ where: { email } }))) {
      return NextResponse.json({ error: "email already registered" }, { status: 409 });
    }
    data.email = email;
  }
  if (body.phone !== undefined) data.phone = clean(body.phone, 40);
  if (body.address !== undefined) data.address = clean(body.address, 255);
  if (body.city !== undefined) data.city = clean(body.city, 120);
  if (body.company !== undefined) data.company = clean(body.company, 190);
  if (body.ice !== undefined) data.ice = ice.value;
  if (body.rc !== undefined) data.rc = clean(body.rc, 60);
  if (body.legalStatus !== undefined) data.legalStatus = isLegalStatus(body.legalStatus) ? body.legalStatus : null;

  if (data.firstName !== undefined || data.lastName !== undefined) {
    const first = (data.firstName as string | null | undefined) ?? client.firstName;
    const last = (data.lastName as string | null | undefined) ?? client.lastName;
    data.name = [first, last].filter(Boolean).join(" ") || client.name;
  }

  const updated = await prisma.user.update({ where: { id: client.id }, data });
  await audit({
    userId: auth.session.user.id,
    action: "client.updated",
    entity: "User",
    entityId: client.id,
    changes: { fields: Object.keys(data) },
    request,
  });

  return NextResponse.json({ ok: true, id: updated.id });
}

export async function DELETE(request: NextRequest, props: Params) {
  const params = await props.params;
  const auth = await requireAdminApi("clients.delete");
  if (auth.error) return auth.error;

  const client = await findClient(params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Orders use onDelete: Restrict — a client with commercial history must be suspended, not deleted.
  const orders = await prisma.order.count({ where: { userId: client.id } });
  if (orders > 0) {
    return NextResponse.json(
      { error: "Client has orders and cannot be deleted. Suspend the account instead." },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id: client.id } });
  await audit({
    userId: auth.session.user.id,
    action: "client.deleted",
    entity: "User",
    entityId: client.id,
    changes: { email: client.email, clientCode: client.clientCode },
    request,
  });

  return NextResponse.json({ ok: true });
}
