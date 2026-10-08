import type { Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { dateFmt, money } from "@/lib/format";
import { LEGAL_STATUSES, LEGAL_STATUS_LABELS, isLegalStatus } from "@/lib/validators";
import { StatusBadge } from "@/components/admin/status-badge";
import { NewClientDialog } from "@/components/admin/new-client-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  searchParams: { q?: string; status?: string; legal?: string; city?: string; sort?: string; page?: string };
};

const PAGE_SIZE = 20;

const sorts: Record<string, Prisma.UserOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  name: { name: "asc" },
  activity: { lastActivityAt: { sort: "desc", nulls: "last" } },
};

export default async function AdminClientsPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("clients.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const q = searchParams.q?.trim();
  const status = searchParams.status === "active" || searchParams.status === "suspended" ? searchParams.status : undefined;
  const legal = isLegalStatus(searchParams.legal) ? searchParams.legal : undefined;
  const city = searchParams.city?.trim();
  const sort = sorts[searchParams.sort ?? ""] ? (searchParams.sort as string) : "newest";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.UserWhereInput = {
    role: "client",
    ...(status ? { accountStatus: status } : {}),
    ...(legal ? { legalStatus: legal } : {}),
    ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
            { ice: { contains: q } },
            { clientCode: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, clients, projects, invoices, tickets, canCreate] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: sorts[sort],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.findMany({
      include: { client: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.invoice.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.supportTicket.findMany({
      include: { requester: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    requirePermission("clients.create"),
  ]);

  // One aggregate query for the whole page (no N+1): order count + revenue per client.
  const ids = clients.map((c) => c.id);
  const stats = ids.length
    ? await prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: ids } },
        _count: { _all: true },
        _sum: { total: true },
      })
    : [];
  const revenue = ids.length
    ? await prisma.order.groupBy({
        by: ["userId"],
        where: { userId: { in: ids }, paymentStatus: "confirmed" },
        _sum: { total: true },
      })
    : [];
  const orderCount = new Map(stats.map((s) => [s.userId, s._count._all]));
  const revenueBy = new Map(revenue.map((s) => [s.userId, Number(s._sum.total ?? 0)]));

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const base = { q, status, legal, city, sort, page: String(page), ...overrides };
    Object.entries(base).forEach(([k, v]) => v && sp.set(k, v));
    return `?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            CRM : comptes clients, historique commercial, projets, factures et tickets.
          </p>
        </div>
        {canCreate ? <NewClientDialog /> : null}
      </div>

      <Tabs defaultValue="clients">
        <TabsList className="flex-wrap">
          <TabsTrigger value="clients">Clients ({total})</TabsTrigger>
          <TabsTrigger value="projects">Projets ({projects.length})</TabsTrigger>
          <TabsTrigger value="invoices">Factures ({invoices.length})</TabsTrigger>
          <TabsTrigger value="tickets">Tickets ({tickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <form className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-6" method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Rechercher (nom, email, tél, ICE, ID…)"
              className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
            />
            <select name="status" defaultValue={status ?? ""} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Tous statuts</option>
              <option value="active">Actifs</option>
              <option value="suspended">Suspendus</option>
            </select>
            <select name="legal" defaultValue={legal ?? ""} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Statut juridique</option>
              {LEGAL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEGAL_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <input name="city" defaultValue={city} placeholder="Ville" className="rounded-lg border px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <select name="sort" defaultValue={sort} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm">
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="name">Nom A→Z</option>
                <option value="activity">Dernière activité</option>
              </select>
              <Button type="submit" variant="accent">
                Filtrer
              </Button>
            </div>
          </form>

          {clients.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-muted-foreground">
              Aucun client ne correspond à ces critères.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto rounded-xl border bg-white md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Ville</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead>Dern. activité</TableHead>
                      <TableHead className="text-right">Cmd</TableHead>
                      <TableHead className="text-right">CA (DH)</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.clientCode ?? "—"}</TableCell>
                        <TableCell>
                          <Link href={`/admin/clients/${c.id}`} className="font-medium text-primary hover:underline">
                            {c.name || c.email}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {c.company || "—"}
                            {c.legalStatus ? ` · ${LEGAL_STATUS_LABELS[c.legalStatus]}` : ""}
                          </p>
                        </TableCell>
                        <TableCell className="text-xs">
                          {c.email}
                          <br />
                          {c.phone || "—"}
                        </TableCell>
                        <TableCell>{c.city || "—"}</TableCell>
                        <TableCell className="text-xs">{dateFmt(c.createdAt)}</TableCell>
                        <TableCell className="text-xs">{dateFmt(c.lastActivityAt)}</TableCell>
                        <TableCell className="text-right">{orderCount.get(c.id) ?? 0}</TableCell>
                        <TableCell className="text-right">{money(revenueBy.get(c.id) ?? 0)}</TableCell>
                        <TableCell>
                          <StatusBadge status={c.accountStatus} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 md:hidden">
                {clients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/clients/${c.id}`}
                    className="block rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-primary">{c.name || c.email}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <StatusBadge status={c.accountStatus} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {c.clientCode ?? "—"} · {c.city || "—"} · {orderCount.get(c.id) ?? 0} cmd ·{" "}
                      {money(revenueBy.get(c.id) ?? 0)} DH
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {pages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {page} / {pages} · {total} clients
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/clients${qs({ page: String(page - 1) })}`}>Précédent</Link>
                  </Button>
                ) : null}
                {page < pages ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/clients${qs({ page: String(page + 1) })}`}>Suivant</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="projects">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Progression</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{pickLocale(p.title as never, params.locale)}</TableCell>
                    <TableCell>{p.client?.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.status}</Badge>
                    </TableCell>
                    <TableCell>{p.progress}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf.</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>{i.reference}</TableCell>
                    <TableCell>{i.user.email}</TableCell>
                    <TableCell>
                      {money(i.totalAmount)} {i.currency}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={i.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <div className="overflow-x-auto rounded-xl border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf.</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.reference}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>{t.requester?.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.status}</Badge>
                    </TableCell>
                    <TableCell>{t.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
