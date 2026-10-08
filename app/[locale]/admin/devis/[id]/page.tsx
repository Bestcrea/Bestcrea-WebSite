import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { roleCan } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dateFmt, dateTimeFmt } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { DocumentEditor, type EditorLine } from "@/components/admin/document-editor";
import { DocumentActions, type DocAction } from "@/components/admin/document-actions";

type Props = { params: { locale: string; id: string } };

export default async function AdminQuoteDetailPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("quotes.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      lines: { orderBy: { position: "asc" } },
      user: { select: { id: true, name: true, email: true, company: true, clientCode: true } },
      quoteRequest: { select: { id: true, number: true } },
      purchaseOrders: { select: { id: true, number: true, status: true } },
      invoices: { select: { id: true, reference: true, status: true } },
    },
  });
  if (!quote) notFound();

  const role = session.user.role;
  const [canEdit, canSend, canPo] = await Promise.all([
    roleCan(role, "quotes.edit"),
    roleCan(role, "quotes.send"),
    roleCan(role, "purchase_orders.create"),
  ]);

  const editable = canEdit && quote.status !== "accepted";
  const url = `/api/admin/quotes/${quote.id}/action`;
  const actions: DocAction[] = [];
  if (canSend && !["accepted", "cancelled"].includes(quote.status)) {
    actions.push({ label: quote.status === "draft" ? "Envoyer au client" : "Renvoyer", url, body: { action: "send" }, variant: "accent" });
  }
  if (canPo && quote.status === "accepted" && quote.purchaseOrders.length === 0) {
    actions.push({ label: "Créer le bon de commande", url, body: { action: "create_purchase_order" }, variant: "accent" });
  }
  if (await roleCan(role, "quotes.create")) actions.push({ label: "Dupliquer", url, body: { action: "duplicate" }, redirect: "/admin/devis/{id}" });
  if (canEdit && !["cancelled", "expired", "accepted"].includes(quote.status)) {
    actions.push({ label: "Marquer expiré", url, body: { action: "expire" } });
    actions.push({ label: "Annuler le devis", url, body: { action: "cancel" }, variant: "destructive", confirm: "Annuler ce devis ?" });
  }

  const lines: EditorLine[] = quote.lines.map((l) => ({
    name: l.name,
    description: l.description ?? "",
    quantity: String(Number(l.quantity)),
    unitPrice: String(Number(l.unitPrice)),
    discountPercent: String(Number(l.discountPercent)),
    taxRate: String(Number(l.taxRate)),
  }));

  return (
    <div className="space-y-6">
      <Link href="/admin/devis" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Devis
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold">{quote.reference}</h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {quote.user ? (
              <Link href={`/admin/clients/${quote.user.id}`} className="text-primary hover:underline">
                {quote.user.company || quote.user.name || quote.user.email}
              </Link>
            ) : "—"}{" "}
            · émis le {dateFmt(quote.issueDate)}
            {quote.sentAt ? ` · envoyé ${dateTimeFmt(quote.sentAt)}` : ""}
            {quote.viewedAt ? ` · consulté ${dateTimeFmt(quote.viewedAt)}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {quote.quoteRequest ? <>Demande : <Link href={`/admin/devis/demandes/${quote.quoteRequest.id}`} className="text-primary hover:underline">{quote.quoteRequest.number}</Link> · </> : null}
            {quote.purchaseOrders.map((p) => (
              <span key={p.id}>BC : <Link href={`/admin/bons-de-commande/${p.id}`} className="text-primary hover:underline">{p.number}</Link> · </span>
            ))}
            {quote.invoices.map((i) => (
              <span key={i.id}>Facture : <Link href={`/admin/facturation/${i.id}`} className="text-primary hover:underline">{i.reference}</Link> · </span>
            ))}
          </p>
        </div>
        <DocumentActions actions={actions} pdfUrl={`/api/documents/quote/${quote.id}/pdf`} />
      </div>

      {quote.modificationRequest ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium">Modification demandée par le client</p>
          <p className="mt-1 whitespace-pre-line">{quote.modificationRequest}</p>
        </div>
      ) : null}
      {quote.rejectionReason ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
          <p className="font-medium">Motif du refus</p>
          <p className="mt-1 whitespace-pre-line">{quote.rejectionReason}</p>
        </div>
      ) : null}

      <DocumentEditor
        kind="quote"
        clients={[]}
        id={quote.id}
        readOnly={!editable}
        initial={{
          title: quote.title,
          description: quote.description ?? "",
          notes: quote.notes ?? "",
          terms: quote.terms ?? "",
          internalNotes: quote.internalNotes ?? "",
          currency: quote.currency,
          date: quote.validUntil ? quote.validUntil.toISOString().slice(0, 10) : "",
          lines: lines.length ? lines : undefined,
        }}
      />
    </div>
  );
}
