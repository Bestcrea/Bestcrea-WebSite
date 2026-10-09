import { setRequestLocale } from "next-intl/server";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { PortalBanner } from "@/components/client/portal-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientPurchaseOrdersPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const list = await prisma.purchaseOrder.findMany({
    where: { userId: session.user.id, status: { not: "draft" } },
    include: { quote: { select: { reference: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PortalBanner icon={ClipboardList} title="Mes bons de commande" description="Générés à partir de vos devis acceptés." />
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
        {list.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucun bon de commande.</p>
        ) : (
          <ul className="divide-y divide-primary/10">
            {list.map((po) => (
              <li key={po.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-primary">{po.number}</p>
                  <p className="text-xs text-muted-foreground">{po.quote ? `Devis ${po.quote.reference} · ` : ""}{dateFmt(po.issueDate)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={po.status} />
                  <p className="font-semibold text-primary">{money(po.total)} {po.currency}</p>
                  <Button asChild variant="accent" size="sm"><a href={`/api/documents/purchase-order/${po.id}/pdf`} target="_blank" rel="noreferrer">PDF</a></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
