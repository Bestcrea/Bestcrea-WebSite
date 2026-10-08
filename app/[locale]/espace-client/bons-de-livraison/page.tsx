import { setRequestLocale } from "next-intl/server";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dateFmt } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";

type Props = { params: { locale: string } };

export default async function ClientDeliveryNotesPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const list = await prisma.deliveryNote.findMany({
    where: { userId: session.user.id, status: { not: "draft" } },
    include: { order: { select: { number: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Mes bons de livraison</h1>
        <p className="mt-2 text-muted-foreground">Preuve de livraison de vos services et livrables.</p>
      </div>
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
        {list.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucun bon de livraison.</p>
        ) : (
          <ul className="divide-y divide-primary/10">
            {list.map((bl) => (
              <li key={bl.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-primary">{bl.number}</p>
                  <p className="text-xs text-muted-foreground">Commande {bl.order.number} · {dateFmt(bl.issueDate)}{bl.deliveredAt ? ` · livré le ${dateFmt(bl.deliveredAt)}` : ""}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={bl.status} />
                  <Button asChild variant="accent" size="sm"><a href={`/api/documents/delivery-note/${bl.id}/pdf`} target="_blank" rel="noreferrer">PDF</a></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
