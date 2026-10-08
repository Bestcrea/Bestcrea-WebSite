import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { LeadsKanban } from "@/components/admin/leads-kanban";

type Props = { params: { locale: string } };

export default async function AdminLeadsPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads & Devis</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline kanban et export CSV des leads.
        </p>
      </div>
      <LeadsKanban
        leads={leads.map((l) => ({
          id: l.id,
          name: l.name,
          email: l.email,
          company: l.company,
          status: l.status,
          source: l.source,
          message: l.message,
          createdAt: l.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
