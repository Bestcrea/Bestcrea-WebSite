import type { InvoiceStatus, Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: { locale: string }; searchParams: { q?: string; status?: string; page?: string } };

const PAGE_SIZE = 20;
const STATUSES: InvoiceStatus[] = ["draft", "sent", "unpaid", "partially_paid", "paid", "overdue", "cancelled"];

export default async function AdminInvoicesPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("invoices.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  // Flag unpaid invoices past their due date as overdue (cheap, idempotent).
  await prisma.invoice.updateMany({
    where: { status: { in: ["unpaid", "sent", "partially_paid"] }, dueAt: { lt: new Date() } },
    data: { status: "overdue" },
  });

  const q = searchParams.q?.trim();
  const status = STATUSES.includes(searchParams.status as InvoiceStatus) ? (searchParams.status as InvoiceStatus) : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: Prisma.InvoiceWhereInput = {
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

  const [total, invoices, sums, canCreate] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: { user: { select: { name: true, email: true, company: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.invoice.groupBy({ by: ["status"], _sum: { totalAmount: true, paidTotal: true }, where: { status: { not: "cancelled" } } }),
    requirePermission("invoices.create"),
  ]);

  const billed = sums.reduce((a, s) => a + Number(s._sum.totalAmount ?? 0), 0);
  const paid = sums.reduce((a, s) => a + Number(s._sum.paidTotal ?? 0), 0);
  const overdue = Number(sums.find((s) => s.status === "overdue")?._sum.totalAmount ?? 0) - Number(sums.find((s) => s.status === "overdue")?._sum.paidTotal ?? 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Facturation</h1>
          <p className="text-sm text-muted-foreground">Factures, paiements et relances.</p>
        </div>
        {canCreate ? (
          <Button asChild variant="accent">
            <Link href="/admin/facturation/new"><Plus className="h-4 w-4" /> Nouvelle facture</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Facturé (DH)", billed],
          ["Encaissé (DH)", paid],
          ["En retard (DH)", Math.max(0, overdue)],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{money(value)}</p>
          </div>
        ))}
      </div>

      <form method="get" className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
        <input name="q" defaultValue={q} placeholder="N°, titre, client…" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button type="submit" variant="accent">Filtrer</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {invoices.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucune facture.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead className="text-right">Payé</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((i) => (
                <TableRow key={i.id}>
                  <TableCell><Link href={`/admin/facturation/${i.id}`} className="font-mono text-xs font-medium text-primary hover:underline">{i.reference}</Link></TableCell>
                  <TableCell className="text-xs">{i.user.company || i.user.name || i.user.email}</TableCell>
                  <TableCell className="text-xs">{dateFmt(i.dueAt)}</TableCell>
                  <TableCell className="text-right">{money(i.totalAmount)} {i.currency}</TableCell>
                  <TableCell className="text-right">{money(i.paidTotal)}</TableCell>
                  <TableCell><StatusBadge status={i.status} /></TableCell>
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
            {page > 1 ? <Button asChild variant="outline" size="sm"><Link href={`/admin/facturation${qs(page - 1)}`}>Précédent</Link></Button> : null}
            {page < pages ? <Button asChild variant="outline" size="sm"><Link href={`/admin/facturation${qs(page + 1)}`}>Suivant</Link></Button> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
