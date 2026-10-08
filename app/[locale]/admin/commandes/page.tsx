import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge, statusLabel } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: { locale: string }; searchParams: { q?: string; status?: string; payment?: string; page?: string } };

const PAGE_SIZE = 20;
const STATUSES: OrderStatus[] = ["pending", "awaiting_payment", "payment_submitted", "payment_confirmed", "processing", "in_progress", "completed", "cancelled", "refunded"];
const PAYMENTS: PaymentStatus[] = ["pending", "submitted", "confirmed", "failed", "refunded"];

export default async function AdminOrdersPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("orders.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const q = searchParams.q?.trim();
  const status = STATUSES.includes(searchParams.status as OrderStatus) ? (searchParams.status as OrderStatus) : undefined;
  const payment = PAYMENTS.includes(searchParams.payment as PaymentStatus) ? (searchParams.payment as PaymentStatus) : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(payment ? { paymentStatus: payment } : {}),
    ...(q
      ? {
          OR: [
            { number: { contains: q, mode: "insensitive" } },
            { user: { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] } },
          ],
        }
      : {}),
  };

  const [total, orders, toVerify] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true, company: true } }, items: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.payment.count({ where: { status: "submitted" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (payment) sp.set("payment", payment);
    sp.set("page", String(p));
    return `?${sp.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Commandes</h1>
        <p className="text-sm text-muted-foreground">
          Commandes du checkout et des bons de commande.{" "}
          {toVerify ? (
            <Link href="/admin/commandes?payment=submitted" className="font-medium text-accent hover:underline">{toVerify} paiement(s) à vérifier</Link>
          ) : null}
        </p>
      </div>

      <form method="get" className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-5">
        <input name="q" defaultValue={q} placeholder="N° ou client…" className="rounded-lg border px-3 py-2 text-sm sm:col-span-2" />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <select name="payment" defaultValue={payment ?? ""} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Tous paiements</option>
          {PAYMENTS.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
        <Button type="submit" variant="accent">Filtrer</Button>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucune commande.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contenu</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell><Link href={`/admin/commandes/${o.id}`} className="font-mono text-xs font-medium text-primary hover:underline">{o.number}</Link></TableCell>
                  <TableCell className="text-xs">{o.user.company || o.user.name || o.user.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{o.items.map((i) => i.name).join(", ")}</TableCell>
                  <TableCell className="text-xs">{dateFmt(o.createdAt)}</TableCell>
                  <TableCell className="text-right">{money(o.total)} {o.currency}</TableCell>
                  <TableCell><StatusBadge status={o.paymentStatus} /></TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
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
            {page > 1 ? <Button asChild variant="outline" size="sm"><Link href={`/admin/commandes${qs(page - 1)}`}>Précédent</Link></Button> : null}
            {page < pages ? <Button asChild variant="outline" size="sm"><Link href={`/admin/commandes${qs(page + 1)}`}>Suivant</Link></Button> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
