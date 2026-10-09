import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPurchaseOrdersPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("purchase_orders.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const list = await prisma.purchaseOrder.findMany({
    include: { user: { select: { name: true, email: true, company: true } }, quote: { select: { id: true, reference: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bons de commande</h1>
        <p className="text-sm text-muted-foreground">Créés automatiquement quand un client accepte un devis, ou depuis un devis accepté.</p>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucun bon de commande.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Devis</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total TTC</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((po) => (
                <TableRow key={po.id}>
                  <TableCell><Link href={`/admin/bons-de-commande/${po.id}`} className="font-mono text-xs font-medium text-primary hover:underline">{po.number}</Link></TableCell>
                  <TableCell className="text-xs">{po.user.company || po.user.name || po.user.email}</TableCell>
                  <TableCell className="text-xs">{po.quote ? <Link href={`/admin/devis/${po.quote.id}`} className="text-primary hover:underline">{po.quote.reference}</Link> : "—"}</TableCell>
                  <TableCell className="text-xs">{dateFmt(po.issueDate)}</TableCell>
                  <TableCell className="text-right">{money(po.total)} {po.currency}</TableCell>
                  <TableCell><StatusBadge status={po.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
