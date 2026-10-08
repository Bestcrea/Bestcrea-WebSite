import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";

type Props = {
  params: { locale: string };
};

export default async function ServicesIndexPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.services");

  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("indexTitle")} description={t("indexDescription")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group rounded-2xl border border-primary/10 bg-background p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-xl hover:shadow-primary/10"
            >
              <h2 className="text-lg font-semibold text-primary">
                {pickLocale(service.title as never, params.locale)}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {pickLocale(service.excerpt as never, params.locale)}
              </p>
              <span className="mt-5 inline-flex text-sm font-medium text-primary">
                {t("explore")} →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
