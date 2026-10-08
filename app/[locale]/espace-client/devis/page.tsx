import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { PortalQuoteRequestForm } from "@/components/client/quote-request-portal-form";

type Props = { params: { locale: string } };

export default async function ClientQuotesPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;
  const userId = session.user.id;

  const [quotes, requests, services] = await Promise.all([
    prisma.quote.findMany({ where: { userId, status: { not: "draft" } }, orderBy: { createdAt: "desc" } }),
    prisma.quoteRequest.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, title: true } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Mes devis</h1>
        <p className="mt-2 text-muted-foreground">Consultez, acceptez ou discutez vos devis, ou demandez-en un nouveau.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">Devis reçus</h2>
        <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
          {quotes.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Aucun devis pour le moment.</p>
          ) : (
            <ul className="divide-y divide-primary/10">
              {quotes.map((q) => (
                <li key={q.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Link href={`/espace-client/devis/${q.id}`} className="font-semibold text-primary hover:underline">{q.reference}</Link>
                    <p className="text-sm text-muted-foreground">{q.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Émis le {dateFmt(q.issueDate)}{q.validUntil ? ` · valable jusqu'au ${dateFmt(q.validUntil)}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge status={q.status} />
                    <p className="font-semibold text-primary">{money(q.total)} {q.currency}</p>
                    <Button asChild variant="outline" size="sm"><a href={`/api/documents/quote/${q.id}/pdf`} target="_blank" rel="noreferrer">PDF</a></Button>
                    <Button asChild variant="accent" size="sm"><Link href={`/espace-client/devis/${q.id}`}>Voir</Link></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-primary">Demander un devis</h2>
        <PortalQuoteRequestForm services={services.map((s) => ({ id: s.id, title: pickLocale(s.title as never, params.locale) }))} />
      </section>

      {requests.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-primary">Mes demandes</h2>
          <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
            <ul className="divide-y divide-primary/10">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-primary">{r.number} — {r.title}</p>
                    <p className="text-xs text-muted-foreground">{dateFmt(r.createdAt)}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </div>
  );
}
