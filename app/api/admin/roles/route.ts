import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { invalidatePermissionCache } from "@/lib/permissions";
import { ALL_PERMISSIONS, STAFF_ROLES, isStaffRole } from "@/lib/rbac";

/** Replace the permission set of one staff role. The `admin` role is immutable (always full access). */
export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi("roles.manage");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { role?: string; permissions?: string[] };
  if (!isStaffRole(body.role) || body.role === "admin") {
    return NextResponse.json({ error: "invalid or immutable role" }, { status: 400 });
  }
  if (!Array.isArray(body.permissions)) {
    return NextResponse.json({ error: "permissions must be an array" }, { status: 400 });
  }
  // Drop unknown keys: never trust the client to define the permission vocabulary.
  const permissions = Array.from(new Set(body.permissions.filter((p) => ALL_PERMISSIONS.includes(p))));

  const before = await prisma.rolePermission.findUnique({ where: { role: body.role } });
  await prisma.rolePermission.upsert({
    where: { role: body.role },
    create: { role: body.role, permissions },
    update: { permissions },
  });
  invalidatePermissionCache(body.role);

  await audit({
    userId: auth.session.user.id,
    action: "role.permissions_changed",
    entity: "RolePermission",
    entityId: body.role,
    changes: { before: before?.permissions ?? null, after: permissions },
    request,
  });

  return NextResponse.json({ ok: true, roles: STAFF_ROLES.length });
}
