import type { Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateTimeFmt } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  params: { locale: string };
  searchParams: { entity?: string; q?: string; page?: string };
};

const PAGE_SIZE = 40;

export default async function AdminAuditPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("audit.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const page = Math.max(1, Number(searchParams.page) || 1);
  const entity = searchParams.entity?.trim();
  const q = searchParams.q?.trim();

  const where: Prisma.AuditLogWhereInput = {
    ...(entity ? { entity } : {}),
    ...(q ? { action: { contains: q, mode: "insensitive" } } : {}),
  };

  const [total, logs, entities] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.groupBy({ by: ["entity"], _count: { _all: true }, orderBy: { entity: "asc" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (entity) sp.set("entity", entity);
    if (q) sp.set("q", q);
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Journal d&apos;audit</h1>
        <p className="text-sm text-muted-foreground">Actions importantes : qui, quoi, quand, depuis quelle IP.</p>
      </div>

      <form method="get" className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="Action (ex. quote.created)" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
        <select name="entity" defaultValue={entity ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Toutes entités</option>
          {entities.map((e) => (
            <option key={e.entity} value={e.entity}>
              {e.entity} ({e._count._all})
            </option>
          ))}
        </select>
        <Button type="submit" variant="accent">
          Filtrer
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {logs.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucune entrée.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap text-xs">{dateTimeFmt(l.createdAt)}</TableCell>
                  <TableCell className="text-xs">{l.user?.name || l.user?.email || "Système"}</TableCell>
                  <TableCell className="font-mono text-xs">{l.action}</TableCell>
                  <TableCell className="text-xs">
                    {l.entity}
                    {l.entityId ? <span className="text-muted-foreground"> · {l.entityId.slice(0, 10)}</span> : null}
                  </TableCell>
                  <TableCell className="text-xs">{l.ip ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} / {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/audit${qs(page - 1)}`}>Précédent</Link>
              </Button>
            ) : null}
            {page < pages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/audit${qs(page + 1)}`}>Suivant</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
