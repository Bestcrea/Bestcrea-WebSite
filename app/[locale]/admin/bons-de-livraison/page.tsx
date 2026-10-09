import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateFmt } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { NewDeliveryNote } from "@/components/admin/new-delivery-note";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminDeliveryNotesPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("delivery_notes.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const [list, orders, canCreate] = await Promise.all([
    prisma.deliveryNote.findMany({
      include: { user: { select: { name: true, email: true, company: true } }, order: { select: { number: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.order.findMany({
      where: { status: { notIn: ["cancelled", "refunded"] } },
      include: { user: { select: { name: true, email: true, company: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    requirePermission("delivery_notes.create"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bons de livraison</h1>
        <p className="text-sm text-muted-foreground">Preuve de livraison des services et livrables, liée à la commande.</p>
      </div>

      {canCreate ? (
        <NewDeliveryNote orders={orders.map((o) => ({ id: o.id, label: `${o.number} — ${o.user.company || o.user.name || o.user.email}` }))} />
      ) : null}

      <div className="overflow-x-auto rounded-xl border bg-white">
        {list.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Aucun bon de livraison.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Livré le</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((d) => (
                <TableRow key={d.id}>
                  <TableCell><Link href={`/admin/bons-de-livraison/${d.id}`} className="font-mono text-xs font-medium text-primary hover:underline">{d.number}</Link></TableCell>
                  <TableCell className="text-xs">{d.user.company || d.user.name || d.user.email}</TableCell>
                  <TableCell className="font-mono text-xs">{d.order.number}</TableCell>
                  <TableCell className="text-xs">{dateFmt(d.issueDate)}</TableCell>
                  <TableCell className="text-xs">{dateFmt(d.deliveredAt)}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
