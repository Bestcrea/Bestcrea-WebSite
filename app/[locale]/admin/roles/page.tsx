import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/admin-auth";
import { getRolePermissions } from "@/lib/permissions";
import { STAFF_ROLES } from "@/lib/rbac";
import { RolesMatrix } from "@/components/admin/roles-matrix";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminRolesPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("roles.manage");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const entries = await Promise.all(
    STAFF_ROLES.map(async (role) => [role, await getRolePermissions(role)] as const)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Rôles &amp; Permissions</h1>
        <p className="text-sm text-muted-foreground">
          Choisissez un rôle puis cochez ce qu&apos;il est autorisé à faire. Les changements sont appliqués immédiatement et journalisés.
        </p>
      </div>
      <RolesMatrix initial={Object.fromEntries(entries)} />
    </div>
  );
}
