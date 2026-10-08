import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac";
import { roleCan } from "@/lib/permissions";

/**
 * Guard for admin API routes. Pass a permission key to enforce RBAC on top of the
 * staff check; omit it to only require a staff session (legacy behaviour).
 */
export async function requireAdminApi(permission?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isStaffRole(session.user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  if (permission && !(await roleCan(session.user.role, permission))) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
