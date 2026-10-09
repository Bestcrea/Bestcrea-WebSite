import { setRequestLocale } from "next-intl/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { AccountsManager } from "@/components/admin/accounts-manager";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminAccountsPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("users.manage");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const accounts = await prisma.user.findMany({
    where: { role: { not: "client" } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, accountStatus: true, lastActivityAt: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Comptes</h1>
        <p className="text-sm text-muted-foreground">
          Comptes du personnel Bestcrea et rôles attribués. Les droits de chaque rôle se règlent dans « Rôles &amp; Permissions ».
        </p>
      </div>
      <AccountsManager
        accounts={accounts.map((a) => ({ ...a, lastActivityAt: a.lastActivityAt?.toISOString() ?? null }))}
        currentUserId={session.user.id}
        actorIsAdmin={session.user.role === "admin"}
      />
    </div>
  );
}
