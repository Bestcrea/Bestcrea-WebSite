import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { roleCan } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dateFmt, dateTimeFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { DocumentEditor, type EditorLine } from "@/components/admin/document-editor";
import { DocumentActions, RecordPaymentForm, type DocAction } from "@/components/admin/document-actions";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function AdminInvoiceDetailPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("invoices.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      lines: { orderBy: { position: "asc" } },
      user: { select: { id: true, name: true, email: true, company: true } },
      quote: { select: { id: true, reference: true } },
      purchaseOrder: { select: { id: true, number: true } },
      order: { select: { id: true, number: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!invoice) notFound();

  const role = session.user.role;
  const [canEdit, canPay, canCreate] = await Promise.all([
    roleCan(role, "invoices.edit"),
    roleCan(role, "invoices.record_payment"),
    roleCan(role, "invoices.create"),
  ]);

  const total = Number(invoice.totalAmount);
  const paid = Number(invoice.paidTotal);
  const remaining = Math.round((total - paid) * 100) / 100;
  const locked = invoice.status === "cancelled" || invoice.status === "paid" || paid > 0;
  const url = `/api/admin/invoices/${invoice.id}/action`;

  const actions: DocAction[] = [];
  if (canEdit && !["cancelled", "paid"].includes(invoice.status)) {
    actions.push({ label: invoice.status === "draft" ? "Envoyer au client" : "Renvoyer", url, body: { action: "send" }, variant: "accent" });
  }
  if (canPay && !["draft", "cancelled", "paid"].includes(invoice.status)) {
    actions.push({ label: "Marquer payée", url, body: { action: "mark_paid", method: "bank_cih" }, confirm: "Enregistrer le solde comme payé (virement CIH par défaut) ? Utilisez le formulaire pour une autre méthode." });
  }
  if (canCreate) actions.push({ label: "Dupliquer", url, body: { action: "duplicate" }, redirect: "/admin/facturation/{id}" });
  if (canEdit && paid === 0 && invoice.status !== "cancelled") {
    actions.push({ label: "Annuler", url, body: { action: "cancel" }, variant: "destructive", confirm: "Annuler cette facture ?" });
  }

  const lines: EditorLine[] = invoice.lines.map((l) => ({
    name: l.name,
    description: l.description ?? "",
    quantity: String(Number(l.quantity)),
    unitPrice: String(Number(l.unitPrice)),
    discountPercent: String(Number(l.discountPercent)),
    taxRate: String(Number(l.taxRate)),
  }));

  return (
    <div className="space-y-6">
      <Link href="/admin/facturation" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Facturation
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold">{invoice.reference}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href={`/admin/clients/${invoice.user.id}`} className="text-primary hover:underline">{invoice.user.company || invoice.user.name || invoice.user.email}</Link>
            {" · "}échéance {dateFmt(invoice.dueAt)}
            {invoice.sentAt ? ` · envoyée ${dateTimeFmt(invoice.sentAt)}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {invoice.quote ? <>Devis <Link href={`/admin/devis/${invoice.quote.id}`} className="text-primary hover:underline">{invoice.quote.reference}</Link> · </> : null}
            {invoice.purchaseOrder ? <>BC <Link href={`/admin/bons-de-commande/${invoice.purchaseOrder.id}`} className="text-primary hover:underline">{invoice.purchaseOrder.number}</Link> · </> : null}
            {invoice.order ? <>Commande {invoice.order.number}</> : null}
          </p>
          <p className="mt-2 text-sm">
            Total <strong>{money(total)} {invoice.currency}</strong> · payé {money(paid)} · reste <strong>{money(Math.max(0, remaining))}</strong>
          </p>
        </div>
        <DocumentActions actions={actions} pdfUrl={`/api/documents/invoice/${invoice.id}/pdf`} />
      </div>

      {canPay && remaining > 0 && !["draft", "cancelled"].includes(invoice.status) ? (
        <RecordPaymentForm invoiceId={invoice.id} remaining={remaining} currency={invoice.currency} />
      ) : null}

      {invoice.payments.length ? (
        <div className="rounded-xl border bg-white">
          <p className="border-b px-4 py-2 text-sm font-medium">Paiements</p>
          {invoice.payments.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-sm last:border-0">
              <span>{p.method}{p.reference ? ` · ${p.reference}` : ""}</span>
              <span>{money(p.amount)} {p.currency}</span>
              <span className="text-xs text-muted-foreground">{dateTimeFmt(p.confirmedAt ?? p.createdAt)}</span>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      ) : null}

      <DocumentEditor
        kind="invoice"
        clients={[]}
        id={invoice.id}
        readOnly={!canEdit || locked}
        initial={{
          title: invoice.title,
          description: invoice.description ?? "",
          notes: invoice.notes ?? "",
          terms: invoice.terms ?? "",
          currency: invoice.currency,
          date: invoice.dueAt ? invoice.dueAt.toISOString().slice(0, 10) : "",
          lines: lines.length ? lines : undefined,
        }}
      />
    </div>
  );
}
