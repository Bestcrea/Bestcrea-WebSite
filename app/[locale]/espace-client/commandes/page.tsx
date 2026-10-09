import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { dateFmt, money } from "@/lib/format";
import { StatusPill as StatusBadge } from "@/components/client/status-pill";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { PortalBanner } from "@/components/client/portal-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientOrdersPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PortalBanner icon={ShoppingBag} title="Mes commandes" description="Suivez vos commandes et vos paiements." />
      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
        {orders.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
        ) : (
          <ul className="divide-y divide-primary/10">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link href={`/espace-client/commandes/${o.id}`} className="font-semibold text-primary hover:underline">{o.number}</Link>
                  <p className="text-sm text-muted-foreground">{o.items.map((i) => i.name).join(", ")}</p>
                  <p className="text-xs text-muted-foreground">{dateFmt(o.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={o.paymentStatus} />
                  <StatusBadge status={o.status} />
                  <p className="font-semibold text-primary">{money(o.total)} {o.currency}</p>
                  <Button asChild variant="accent" size="sm"><Link href={`/espace-client/commandes/${o.id}`}>Détails</Link></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
