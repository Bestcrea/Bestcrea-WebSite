import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { DocumentEditor } from "@/components/admin/document-editor";

type Props = { params: { locale: string }; searchParams: { clientId?: string } };

export default async function NewInvoicePage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);
  const session = await requirePermission("invoices.create");
  if (!session) return <p className="text-sm text-muted-foreground">Accès refusé.</p>;

  const clients = await prisma.user.findMany({
    where: { role: "client", accountStatus: "active" },
    select: { id: true, name: true, email: true, company: true, clientCode: true },
    orderBy: { name: "asc" },
    take: 1000,
  });
  const due = new Date();
  due.setDate(due.getDate() + 15);

  return (
    <div className="space-y-5">
      <Link href="/admin/facturation" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Facturation
      </Link>
      <h1 className="text-2xl font-semibold">Nouvelle facture</h1>
      <DocumentEditor
        kind="invoice"
        clients={clients.map((c) => ({ id: c.id, label: `${c.clientCode ?? ""} ${c.company || c.name || c.email} — ${c.email}`.trim() }))}
        initial={{ userId: searchParams.clientId ?? "", date: due.toISOString().slice(0, 10) }}
      />
    </div>
  );
}
