import { prisma } from "@/lib/prisma";
import { DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSIONS, isStaffRole, type StaffRole } from "@/lib/rbac";

const TTL_MS = 30_000;
const cache = new Map<string, { at: number; permissions: string[] }>();

/** Drop cached permissions (call after an administrator edits a role). */
export function invalidatePermissionCache(role?: string) {
  if (role) cache.delete(role);
  else cache.clear();
}

/** Effective permissions for a role: DB override if present, else the built-in defaults. */
export async function getRolePermissions(role?: string | null): Promise<string[]> {
  if (!role) return [];
  if (role === "admin") return ALL_PERMISSIONS;
  if (!isStaffRole(role)) return [];

  const hit = cache.get(role);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.permissions;

  let permissions = DEFAULT_ROLE_PERMISSIONS[role as StaffRole] ?? [];
  try {
    const row = await prisma.rolePermission.findUnique({ where: { role } });
    if (row) permissions = row.permissions.filter((p) => ALL_PERMISSIONS.includes(p));
  } catch {
    // Table missing (migration not applied yet): fall back to defaults.
  }

  cache.set(role, { at: Date.now(), permissions });
  return permissions;
}

export async function roleCan(role: string | null | undefined, permission: string) {
  if (role === "admin") return true;
  const permissions = await getRolePermissions(role);
  return permissions.includes(permission);
}
