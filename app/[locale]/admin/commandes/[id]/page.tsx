import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { roleCan } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { dateTimeFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderStatusForm, PaymentVerify } from "@/components/admin/order-controls";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ locale: string; id: string }> };

const METHOD_LABELS: Record<string, string> = {
  bank_cih: "Virement CIH", bank_albarid: "Virement Al Barid Bank", bank_chaabi: "Virement Banque Populaire",
  ria: "RIA", western_union: "Western Union", cash_plus: "Cash Plus", paypal: "PayPal",
};

export default async function AdminOrderPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("orders.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, company: true, clientCode: true } },
      items: true,
      payments: { orderBy: { createdAt: "desc" }, include: { confirmedBy: { select: { name: true, email: true } } } },
      invoices: { select: { id: true, reference: true, status: true } },
      deliveryNotes: { select: { id: true, number: true, status: true } },
      quote: { select: { id: true, reference: true } },
      purchaseOrder: { select: { id: true, number: true } },
    },
  });
  if (!order) notFound();

  const role = session.user.role;
  const [canManage, canVerify, canBl] = await Promise.all([
    roleCan(role, "orders.manage"),
    roleCan(role, "payments.verify"),
    roleCan(role, "delivery_notes.create"),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/commandes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Commandes
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold">{order.number}</h1>
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link href={`/admin/clients/${order.user.id}`} className="text-primary hover:underline">{order.user.company || order.user.name || order.user.email}</Link>
          {order.user.clientCode ? ` (${order.user.clientCode})` : ""} · {order.user.email}{order.user.phone ? ` · ${order.user.phone}` : ""} · {dateTimeFmt(order.createdAt)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {order.quote ? <>Devis <Link href={`/admin/devis/${order.quote.id}`} className="text-primary hover:underline">{order.quote.reference}</Link> · </> : null}
          {order.purchaseOrder ? <>BC <Link href={`/admin/bons-de-commande/${order.purchaseOrder.id}`} className="text-primary hover:underline">{order.purchaseOrder.number}</Link> · </> : null}
          {order.invoices.map((i) => <span key={i.id}>Facture <Link href={`/admin/facturation/${i.id}`} className="text-primary hover:underline">{i.reference}</Link> · </span>)}
          {order.deliveryNotes.map((d) => <span key={d.id}>BL <Link href={`/admin/bons-de-livraison/${d.id}`} className="text-primary hover:underline">{d.number}</Link> · </span>)}
        </p>
      </div>

      <div className="rounded-xl border bg-white">
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between border-b px-4 py-3 text-sm">
            <span>{i.name} <span className="text-xs text-muted-foreground">× {i.quantity}</span></span>
            <span>{money(i.total)} {order.currency} HT</span>
          </div>
        ))}
        <div className="space-y-1 p-4 text-right text-sm">
          {Number(order.discountTotal) > 0 ? <p className="text-emerald-700">Réduction {order.couponCode ? `(${order.couponCode})` : ""} : - {money(order.discountTotal)}</p> : null}
          {Number(order.taxTotal) > 0 ? <p>TVA : {money(order.taxTotal)} {order.currency}</p> : null}
          <p className="text-lg font-semibold text-primary">Total TTC : {money(order.total)} {order.currency}</p>
        </div>
      </div>
      {order.customerNotes ? <p className="rounded-xl border bg-white p-4 text-sm"><span className="font-medium">Remarque du client : </span>{order.customerNotes}</p> : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Paiements</h2>
        {order.payments.length === 0 ? <p className="text-sm text-muted-foreground">Aucun paiement.</p> : null}
        {order.payments.map((p) => (
          <div key={p.id} className="space-y-3 rounded-xl border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{METHOD_LABELS[p.method] ?? p.method}</span>
              <span>{money(p.amount)} {p.currency}</span>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Référence : {p.reference || p.providerTransactionId || "—"}
              {p.confirmedAt ? ` · confirmé ${dateTimeFmt(p.confirmedAt)}${p.confirmedBy ? ` par ${p.confirmedBy.name || p.confirmedBy.email}` : " (vérification automatique)"}` : ""}
              {p.notes ? ` · note : ${p.notes}` : ""}
            </p>
            {p.proofPath ? (
              <Button asChild variant="outline" size="sm">
                <a href={`/api/payments/${p.id}/proof`} target="_blank" rel="noreferrer">Voir le justificatif ({p.proofName})</a>
              </Button>
            ) : null}
            {["pending", "submitted", "failed"].includes(p.status) ? (
              <PaymentVerify paymentId={p.id} canVerify={canVerify} isPaypal={p.method === "paypal"} />
            ) : null}
          </div>
        ))}
      </div>

      {canManage ? <OrderStatusForm orderId={order.id} status={order.status} internalNotes={order.internalNotes ?? ""} /> : null}
      {canBl && order.paymentStatus === "confirmed" ? (
        <Button asChild variant="outline"><Link href="/admin/bons-de-livraison">Créer un bon de livraison</Link></Button>
      ) : null}
    </div>
  );
}
