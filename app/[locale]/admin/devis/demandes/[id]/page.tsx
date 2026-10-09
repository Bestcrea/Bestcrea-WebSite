import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { dateFmt, dateTimeFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { RequestStatusForm } from "@/components/admin/request-status-form";

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function AdminQuoteRequestPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requirePermission("quotes.view");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const r = await prisma.quoteRequest.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, company: true, clientCode: true } },
      service: { select: { slug: true } },
      quotes: { select: { id: true, reference: true, status: true, total: true, currency: true } },
    },
  });
  if (!r) notFound();
  const canCreate = await requirePermission("quotes.create");

  const rows: [string, React.ReactNode][] = [
    ["Client", <Link key="c" href={`/admin/clients/${r.user.id}`} className="text-primary hover:underline">{r.user.company || r.user.name || r.user.email} ({r.user.clientCode ?? "—"})</Link>],
    ["Contact", `${r.user.email}${r.user.phone ? ` · ${r.user.phone}` : ""}`],
    ["Service", r.service?.slug ?? "—"],
    ["Quantité", r.quantity ?? "—"],
    ["Budget estimé", r.budget ?? "—"],
    ["Délai souhaité", dateFmt(r.desiredDeadline)],
    ["Reçue le", dateTimeFmt(r.createdAt)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/devis" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Devis
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold">{r.number}</h1>
          <StatusBadge status={r.status} />
        </div>
        {canCreate ? (
          <Button asChild variant="accent">
            <Link href={`/admin/devis/new?requestId=${r.id}`}>Créer un devis</Link>
          </Button>
        ) : null}
      </div>

      <div className="rounded-xl border bg-white p-5">
        <h2 className="text-lg font-medium">{r.title}</h2>
        <p className="mt-2 whitespace-pre-line text-sm">{r.description}</p>
        {r.requirements ? <p className="mt-3 whitespace-pre-line text-sm"><span className="font-medium">Exigences : </span>{r.requirements}</p> : null}
        {r.notes ? <p className="mt-3 whitespace-pre-line text-sm"><span className="font-medium">Notes : </span>{r.notes}</p> : null}
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex gap-2"><dt className="w-32 text-muted-foreground">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>

      {r.quotes.length ? (
        <div className="rounded-xl border bg-white p-4">
          <p className="mb-2 text-sm font-medium">Devis liés</p>
          {r.quotes.map((q) => (
            <div key={q.id} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
              <Link href={`/admin/devis/${q.id}`} className="font-mono text-xs text-primary hover:underline">{q.reference}</Link>
              <span>{money(q.total)} {q.currency}</span>
              <StatusBadge status={q.status} />
            </div>
          ))}
        </div>
      ) : null}

      <RequestStatusForm id={r.id} status={r.status} internalNotes={r.internalNotes ?? ""} />
    </div>
  );
}
