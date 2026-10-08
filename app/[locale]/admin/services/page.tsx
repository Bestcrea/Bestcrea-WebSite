import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ServicesPricingManager } from "@/components/admin/services-pricing-manager";

type Props = { params: { locale: string } };

export default async function AdminServicesPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const [services, plans] = await Promise.all([
    prisma.service.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Services & Pricing</h1>
        <p className="text-sm text-muted-foreground">
          CRUD services en base + vue des plans tarifaires.
        </p>
      </div>
      <ServicesPricingManager
        locale={params.locale}
        services={services.map((s) => ({
          id: s.id,
          slug: s.slug,
          title: s.title as never,
          excerpt: s.excerpt as never,
          description: s.description as never,
          isActive: s.isActive,
          sortOrder: s.sortOrder,
          icon: s.icon,
        }))}
        plans={plans.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name as never,
          price: Number(p.price),
          currency: p.currency,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          sortOrder: p.sortOrder,
        }))}
      />
    </div>
  );
}
