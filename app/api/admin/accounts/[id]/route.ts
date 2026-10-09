import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { isStaffRole } from "@/lib/rbac";
import { clean } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

async function activeAdminCount() {
  return prisma.user.count({ where: { role: "admin", accountStatus: "active" } });
}

export async function PATCH(request: NextRequest, props: Params) {
  const params = await props.params;
  const auth = await requireAdminApi("users.manage");
  if (auth.error) return auth.error;

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role === "client") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    role?: string;
    phone?: string | null;
    accountStatus?: "active" | "suspended";
  };
  const actorIsAdmin = auth.session.user.role === "admin";

  // Touching an administrator account (or granting the role) is reserved to administrators.
  if ((target.role === "admin" || body.role === "admin") && !actorIsAdmin) {
    return NextResponse.json({ error: "Only an administrator can manage administrators" }, { status: 403 });
  }

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = clean(body.name, 160);
  if (body.phone !== undefined) data.phone = clean(body.phone, 40);
  if (body.role !== undefined) {
    if (!isStaffRole(body.role)) return NextResponse.json({ error: "invalid role" }, { status: 400 });
    data.role = body.role;
  }
  if (body.accountStatus !== undefined) {
    if (body.accountStatus !== "active" && body.accountStatus !== "suspended") {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    data.accountStatus = body.accountStatus;
  }

  // Never allow the platform to be left without an active administrator.
  const losesAdmin =
    target.role === "admin" &&
    ((data.role && data.role !== "admin") || data.accountStatus === "suspended");
  if (losesAdmin && (await activeAdminCount()) <= 1) {
    return NextResponse.json({ error: "At least one active administrator is required" }, { status: 409 });
  }
  if (target.id === auth.session.user.id && data.accountStatus === "suspended") {
    return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 409 });
  }

  await prisma.user.update({ where: { id: target.id }, data });
  await audit({
    userId: auth.session.user.id,
    action: data.role ? "account.role_changed" : "account.updated",
    entity: "User",
    entityId: target.id,
    changes: { before: { role: target.role, accountStatus: target.accountStatus }, after: data as never },
    request,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, props: Params) {
  const params = await props.params;
  const auth = await requireAdminApi("users.manage");
  if (auth.error) return auth.error;

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target || target.role === "client") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.id === auth.session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 409 });
  }
  if (target.role === "admin") {
    if (auth.session.user.role !== "admin") {
      return NextResponse.json({ error: "Only an administrator can delete administrators" }, { status: 403 });
    }
    if ((await activeAdminCount()) <= 1) {
      return NextResponse.json({ error: "At least one active administrator is required" }, { status: 409 });
    }
  }

  await prisma.user.delete({ where: { id: target.id } });
  await audit({
    userId: auth.session.user.id,
    action: "account.deleted",
    entity: "User",
    entityId: target.id,
    changes: { email: target.email, role: target.role },
    request,
  });
  return NextResponse.json({ ok: true });
}
