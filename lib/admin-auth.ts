import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac";
import { roleCan } from "@/lib/permissions";

export { isStaffRole };

/** Any authenticated staff account (admin, director, gérant, manager, …). */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  if (!isStaffRole(session.user.role)) return null;
  return session;
}

/** Staff session that also holds a specific permission. Returns null otherwise. */
export async function requirePermission(permission: string) {
  const session = await requireAdminSession();
  if (!session) return null;
  if (!(await roleCan(session.user.role, permission))) return null;
  return session;
}
