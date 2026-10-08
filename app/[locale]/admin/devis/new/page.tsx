import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { DocumentEditor } from "@/components/admin/document-editor";

type Props = { params: { locale: string }; searchParams: { clientId?: string; requestId?: string } };

export default async function NewQuotePage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("quotes.create");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const [clients, request] = await Promise.all([
    prisma.user.findMany({
      where: { role: "client", accountStatus: "active" },
      select: { id: true, name: true, email: true, company: true, clientCode: true },
      orderBy: { name: "asc" },
      take: 1000,
    }),
    searchParams.requestId ? prisma.quoteRequest.findUnique({ where: { id: searchParams.requestId } }) : null,
  ]);

  return (
    <div className="space-y-5">
      <Link href="/admin/devis" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Devis
      </Link>
      <h1 className="text-2xl font-semibold">Nouveau devis</h1>
      {request ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
          <p className="font-medium">Depuis la demande {request.number} — {request.title}</p>
          <p className="mt-1 whitespace-pre-line text-muted-foreground">{request.description}</p>
        </div>
      ) : null}
      <DocumentEditor
        kind="quote"
        clients={clients.map((c) => ({
          id: c.id,
          label: `${c.clientCode ?? ""} ${c.company || c.name || c.email} — ${c.email}`.trim(),
        }))}
        initial={{
          userId: request?.userId ?? searchParams.clientId ?? "",
          title: request?.title ?? "",
          description: request?.description ?? "",
          quoteRequestId: request?.id,
          lines: request
            ? [{ name: request.title, description: "", quantity: String(request.quantity ?? 1), unitPrice: "0", discountPercent: "0", taxRate: "0" }]
            : undefined,
        }}
      />
    </div>
  );
}
