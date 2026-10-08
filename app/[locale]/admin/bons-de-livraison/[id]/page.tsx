import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { roleCan } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dateFmt, dateTimeFmt } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { DocumentActions, type DocAction } from "@/components/admin/document-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = { params: { locale: string; id: string } };

export default async function AdminDeliveryNotePage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("delivery_notes.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const bl = await prisma.deliveryNote.findUnique({
    where: { id: params.id },
    include: {
      lines: { orderBy: { position: "asc" } },
      user: { select: { id: true, name: true, email: true, company: true } },
      order: { select: { id: true, number: true } },
    },
  });
  if (!bl) notFound();

  const canEdit = await roleCan(session.user.role, "delivery_notes.edit");
  const url = `/api/admin/delivery-notes/${bl.id}`;
  const actions: DocAction[] = [];
  if (canEdit && bl.status !== "cancelled") {
    if (bl.status === "draft") actions.push({ label: "Envoyer au client", url, body: { action: "send" }, variant: "accent" });
    if (bl.status !== "delivered") actions.push({ label: "Marquer livré", url, body: { action: "deliver" }, variant: "accent" });
    actions.push({ label: "Annuler", url, body: { action: "cancel" }, variant: "destructive", confirm: "Annuler ce bon de livraison ?" });
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/bons-de-livraison" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Bons de livraison
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold">{bl.number}</h1>
            <StatusBadge status={bl.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/admin/clients/${bl.user.id}`} className="text-primary hover:underline">{bl.user.company || bl.user.name || bl.user.email}</Link>
            {" · "}Commande {bl.order.number} · émis le {dateFmt(bl.issueDate)}
            {bl.deliveredAt ? ` · livré ${dateTimeFmt(bl.deliveredAt)}` : ""}
          </p>
          {bl.notes ? <p className="mt-2 whitespace-pre-line text-sm">{bl.notes}</p> : null}
        </div>
        <DocumentActions actions={actions} pdfUrl={`/api/documents/delivery-note/${bl.id}/pdf`} />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Désignation</TableHead>
              <TableHead className="text-right">Quantité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bl.lines.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.name}{l.description ? <p className="text-xs text-muted-foreground">{l.description}</p> : null}</TableCell>
                <TableCell className="text-right">{Number(l.quantity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
