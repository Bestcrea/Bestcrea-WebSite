import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { roleCan } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { DocumentActions, type DocAction } from "@/components/admin/document-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: { locale: string; id: string } };

export default async function AdminPurchaseOrderPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("purchase_orders.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: params.id },
    include: {
      lines: { orderBy: { position: "asc" } },
      user: { select: { id: true, name: true, email: true, company: true } },
      quote: { select: { id: true, reference: true } },
      orders: { select: { id: true, number: true, status: true } },
      invoices: { select: { id: true, reference: true, status: true } },
    },
  });
  if (!po) notFound();

  const role = session.user.role;
  const [canEdit, canOrder, canInvoice] = await Promise.all([
    roleCan(role, "purchase_orders.edit"),
    roleCan(role, "orders.manage"),
    roleCan(role, "invoices.create"),
  ]);
  const url = `/api/admin/purchase-orders/${po.id}/action`;
  const actions: DocAction[] = [];
  if (po.status !== "cancelled") {
    if (canEdit) actions.push({ label: po.status === "draft" ? "Envoyer au client" : "Renvoyer", url, body: { action: "send" }, variant: "accent" });
    if (canOrder && po.orders.length === 0) actions.push({ label: "Créer la commande", url, body: { action: "create_order" } });
    if (canInvoice && po.invoices.length === 0) actions.push({ label: "Créer la facture", url, body: { action: "create_invoice" }, redirect: "/admin/facturation/{id}" });
    if (canEdit) actions.push({ label: "Annuler", url, body: { action: "cancel" }, variant: "destructive", confirm: "Annuler ce bon de commande ?" });
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/bons-de-commande" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Bons de commande
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold">{po.number}</h1>
            <StatusBadge status={po.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/admin/clients/${po.user.id}`} className="text-primary hover:underline">{po.user.company || po.user.name || po.user.email}</Link>
            {" · "}{dateFmt(po.issueDate)}
            {po.quote ? <> · Devis <Link href={`/admin/devis/${po.quote.id}`} className="text-primary hover:underline">{po.quote.reference}</Link></> : null}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {po.orders.map((o) => <span key={o.id}>Commande {o.number} ({o.status}) · </span>)}
            {po.invoices.map((i) => <span key={i.id}>Facture <Link href={`/admin/facturation/${i.id}`} className="text-primary hover:underline">{i.reference}</Link> · </span>)}
          </p>
        </div>
        <DocumentActions actions={actions} pdfUrl={`/api/documents/purchase-order/${po.id}/pdf`} />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Désignation</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead className="text-right">P.U. HT</TableHead>
              <TableHead className="text-right">Rem.</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">Total HT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {po.lines.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.name}{l.description ? <p className="text-xs text-muted-foreground">{l.description}</p> : null}</TableCell>
                <TableCell className="text-right">{Number(l.quantity)}</TableCell>
                <TableCell className="text-right">{money(l.unitPrice)}</TableCell>
                <TableCell className="text-right">{Number(l.discountPercent)}%</TableCell>
                <TableCell className="text-right">{Number(l.taxRate)}%</TableCell>
                <TableCell className="text-right font-medium">{money(l.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="space-y-1 border-t p-4 text-right text-sm">
          <p>Total HT : {money(po.totalHt)} {po.currency}</p>
          {Number(po.taxTotal) > 0 ? <p>TVA : {money(po.taxTotal)} {po.currency}</p> : null}
          <p className="text-base font-semibold text-primary">Total TTC : {money(po.total)} {po.currency}</p>
        </div>
      </div>
    </div>
  );
}
