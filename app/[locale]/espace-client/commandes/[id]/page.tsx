import { Suspense } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { getPaymentOptions } from "@/lib/payment-config";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { OrderPaymentPanel } from "@/components/client/order-payment-panel";

type Props = { params: { locale: string; id: string }; searchParams: { new?: string; uploadError?: string; paypalError?: string; cancelled?: string } };

export default async function ClientOrderPage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  // Ownership is in the query: another client's order id is a 404.
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      invoices: { where: { status: { not: "draft" } }, select: { id: true, reference: true } },
      deliveryNotes: { where: { status: { not: "draft" } }, select: { id: true, number: true } },
    },
  });
  if (!order) notFound();

  const payment = order.payments[0];
  const option = payment ? getPaymentOptions().find((o) => o.id === payment.method) : undefined;
  const awaiting = payment && !["confirmed", "refunded"].includes(payment.status) && order.status !== "cancelled";

  return (
    <div className="space-y-6">
      <Link href="/espace-client/commandes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Mes commandes
      </Link>

      {searchParams.new ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Merci, votre commande {order.number} est enregistrée.</p>
            <p>Elle sera confirmée dès la vérification de votre paiement par notre équipe.</p>
          </div>
        </div>
      ) : null}
      {searchParams.uploadError !== undefined ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">
          Commande créée, mais le justificatif n&apos;a pas pu être envoyé{searchParams.uploadError ? ` : ${searchParams.uploadError}` : ""}. Réessayez ci-dessous.
        </div>
      ) : null}
      {searchParams.paypalError || searchParams.cancelled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">Le paiement PayPal n&apos;a pas été finalisé. Vous pouvez réessayer ci-dessous.</div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-primary">{order.number}</h1>
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Passée le {dateFmt(order.createdAt)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
        <table className="w-full text-sm">
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-4">{i.name}</td>
                <td className="p-4 text-right">{money(i.total)} {order.currency} HT</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 p-4 text-right text-sm">
          {Number(order.discountTotal) > 0 ? <p className="text-emerald-700">Réduction {order.couponCode ? `(${order.couponCode})` : ""} : - {money(order.discountTotal)} {order.currency}</p> : null}
          <p>TVA : {money(order.taxTotal)} {order.currency}</p>
          <p className="text-lg font-semibold text-primary">Total TTC : {money(order.total)} {order.currency}</p>
        </div>
      </div>

      {awaiting && payment && option ? (
        <Suspense fallback={null}>
          <OrderPaymentPanel
            orderId={order.id}
            method={payment.method}
            paymentStatus={payment.status}
            instructions={option.instructions}
            whatsapp={option.whatsapp}
            currentReference={payment.reference}
            hasProof={!!payment.proofPath}
            paymentId={payment.id}
            locale={params.locale}
          />
        </Suspense>
      ) : null}

      {payment?.status === "confirmed" ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Paiement confirmé. Merci !</p>
      ) : null}

      {order.invoices.length || order.deliveryNotes.length ? (
        <div className="flex flex-wrap gap-2">
          {order.invoices.map((inv) => (
            <Button key={inv.id} asChild variant="outline" size="sm"><a href={`/api/documents/invoice/${inv.id}/pdf`} target="_blank" rel="noreferrer">Facture {inv.reference}</a></Button>
          ))}
          {order.deliveryNotes.map((bl) => (
            <Button key={bl.id} asChild variant="outline" size="sm"><a href={`/api/documents/delivery-note/${bl.id}/pdf`} target="_blank" rel="noreferrer">BL {bl.number}</a></Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
