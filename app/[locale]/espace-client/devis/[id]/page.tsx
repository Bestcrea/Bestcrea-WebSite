import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { QuoteResponse } from "@/components/client/quote-response";

type Props = { params: { locale: string; id: string } };

export default async function ClientQuoteDetailPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  // Ownership is part of the query so one client can never open another client's quote.
  let quote = await prisma.quote.findFirst({
    where: { id: params.id, userId: session.user.id, status: { not: "draft" } },
    include: { lines: { orderBy: { position: "asc" } }, purchaseOrders: { select: { id: true, number: true } } },
  });
  if (!quote) notFound();

  if (quote.status === "sent") {
    await prisma.quote.update({ where: { id: quote.id }, data: { status: "viewed", viewedAt: new Date() } });
    quote = { ...quote, status: "viewed" };
  }

  const answerable = ["sent", "viewed", "pending"].includes(quote.status);

  return (
    <div className="space-y-6">
      <Link href="/espace-client/devis" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Mes devis
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-primary">{quote.reference}</h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="mt-1 text-muted-foreground">{quote.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Émis le {dateFmt(quote.issueDate)}{quote.validUntil ? ` · valable jusqu'au ${dateFmt(quote.validUntil)}` : ""}
          </p>
        </div>
        <Button asChild variant="outline"><a href={`/api/documents/quote/${quote.id}/pdf`} target="_blank" rel="noreferrer">Télécharger le PDF</a></Button>
      </div>

      {quote.description ? <p className="whitespace-pre-line text-sm">{quote.description}</p> : null}

      <div className="overflow-x-auto rounded-3xl border border-primary/10 bg-background">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="p-3">Désignation</th>
              <th className="p-3 text-right">Qté</th>
              <th className="p-3 text-right">P.U. HT</th>
              <th className="p-3 text-right">Rem.</th>
              <th className="p-3 text-right">TVA</th>
              <th className="p-3 text-right">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l) => (
              <tr key={l.id} className="border-b last:border-0">
                <td className="p-3">{l.name}{l.description ? <p className="text-xs text-muted-foreground">{l.description}</p> : null}</td>
                <td className="p-3 text-right">{Number(l.quantity)}</td>
                <td className="p-3 text-right">{money(l.unitPrice)}</td>
                <td className="p-3 text-right">{Number(l.discountPercent)}%</td>
                <td className="p-3 text-right">{Number(l.taxRate)}%</td>
                <td className="p-3 text-right font-medium">{money(l.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 border-t p-4 text-right text-sm">
          <p>Total HT : {money(quote.totalHt)} {quote.currency}</p>
          {Number(quote.taxTotal) > 0 ? <p>TVA : {money(quote.taxTotal)} {quote.currency}</p> : null}
          <p className="text-lg font-semibold text-primary">Total TTC : {money(quote.total)} {quote.currency}</p>
        </div>
      </div>

      {quote.notes ? <p className="whitespace-pre-line text-sm"><span className="font-medium">Notes : </span>{quote.notes}</p> : null}
      {quote.terms ? <p className="whitespace-pre-line text-xs text-muted-foreground"><span className="font-medium">Conditions : </span>{quote.terms}</p> : null}

      {quote.status === "pending" && quote.modificationRequest ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">Votre demande de modification a été transmise : « {quote.modificationRequest} »</div>
      ) : null}
      {quote.status === "accepted" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          Devis accepté. {quote.purchaseOrders.length ? <>Bon de commande : {quote.purchaseOrders.map((p) => p.number).join(", ")} — <Link href="/espace-client/bons-de-commande" className="underline">voir mes bons de commande</Link>.</> : null}
        </div>
      ) : null}

      {answerable ? <QuoteResponse quoteId={quote.id} /> : null}
    </div>
  );
}
