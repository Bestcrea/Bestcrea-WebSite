import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { PartnersTestimonialsManager } from "@/components/admin/partners-manager";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminPartenairesPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const [partners, testimonials] = await Promise.all([
    prisma.partner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Partenaires & Témoignages</h1>
        <p className="text-sm text-muted-foreground">CRUD avec réordonnancement.</p>
      </div>
      <PartnersTestimonialsManager
        locale={params.locale}
        partners={partners.map((p) => ({
          id: p.id,
          name: p.name,
          website: p.website,
          sortOrder: p.sortOrder,
          isActive: p.isActive,
        }))}
        testimonials={testimonials.map((t) => ({
          id: t.id,
          authorName: t.authorName,
          company: t.company,
          content: t.content as never,
          sortOrder: t.sortOrder,
          isActive: t.isActive,
          isFeatured: t.isFeatured,
        }))}
      />
    </div>
  );
}
