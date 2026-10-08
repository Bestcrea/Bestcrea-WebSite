import type { Prisma, QuoteStatus } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: { locale: string }; searchParams: { q?: string; status?: string; page?: string } };

const PAGE_SIZE = 20;
const STATUSES: QuoteStatus[] = ["draft", "sent", "viewed", "pending", "accepted", "rejected", "expired", "cancelled"];

export default async function AdminQuotesPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("quotes.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const q = searchParams.q?.trim();
  const status = STATUSES.includes(searchParams.status as QuoteStatus) ? (searchParams.status as QuoteStatus) : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.QuoteWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
            { user: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] } },
          ],
        }
      : {}),
  };

  const [total, quotes, requests, canCreate] = await Promise.all([
    prisma.quote.count({ where }),
    prisma.quote.findMany({
      where,
      include: { user: { select: { name: true, email: true, company: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.quoteRequest.findMany({
      include: { user: { select: { name: true, email: true } }, _count: { select: { quotes: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    requirePermission("quotes.create"),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };
  const newRequests = requests.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Devis</h1>
          <p className="text-sm text-muted-foreground">Demandes clients, création, envoi et suivi des devis.</p>
        </div>
        {canCreate ? (
          <Button asChild variant="accent">
            <Link href="/admin/devis/new"><Plus className="h-4 w-4" /> Nouveau devis</Link>
          </Button>
        ) : null}
      </div>

      <Tabs defaultValue="quotes">
        <TabsList>
          <TabsTrigger value="quotes">Devis ({total})</TabsTrigger>
          <TabsTrigger value="requests">Demandes de devis ({requests.length}{newRequests ? ` · ${newRequests} nouvelle(s)` : ""})</TabsTrigger>
        </TabsList>

        <TabsContent value="quotes" className="space-y-4">
          <form method="get" className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
            <input name="q" defaultValue={q} placeholder="N°, titre, client…" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
            <select name="status" defaultValue={status ?? ""} className="rounded-lg border px-3 py-2 text-sm">
              <option value="">Tous statuts</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button type="submit" variant="accent">Filtrer</Button>
          </form>

          <div className="overflow-x-auto rounded-xl border bg-white">
            {quotes.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Aucun devis.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Total TTC</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Link href={`/admin/devis/${d.id}`} className="font-mono text-xs font-medium text-primary hover:underline">{d.reference}</Link>
                      </TableCell>
                      <TableCell className="text-xs">{d.user?.company || d.user?.name || d.user?.email || "—"}</TableCell>
                      <TableCell>{d.title}</TableCell>
                      <TableCell className="text-xs">{dateFmt(d.issueDate)}</TableCell>
                      <TableCell className="text-right">{money(d.total)} {d.currency}</TableCell>
                      <TableCell><StatusBadge status={d.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {pages > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Page {page} / {pages}</p>
              <div className="flex gap-2">
                {page > 1 ? <Button asChild variant="outline" size="sm"><Link href={`/admin/devis${qs(page - 1)}`}>Précédent</Link></Button> : null}
                {page < pages ? <Button asChild variant="outline" size="sm"><Link href={`/admin/devis${qs(page + 1)}`}>Suivant</Link></Button> : null}
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="requests">
          <div className="overflow-x-auto rounded-xl border bg-white">
            {requests.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted-foreground">Aucune demande de devis.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Objet</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Devis</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link href={`/admin/devis/demandes/${r.id}`} className="font-mono text-xs font-medium text-primary hover:underline">{r.number}</Link>
                      </TableCell>
                      <TableCell className="text-xs">{r.user.name || r.user.email}</TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell className="text-xs">{r.budget || "—"}</TableCell>
                      <TableCell className="text-xs">{dateFmt(r.createdAt)}</TableCell>
                      <TableCell>{r._count.quotes}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
