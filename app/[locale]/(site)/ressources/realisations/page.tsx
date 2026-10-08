import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { PortfolioFilterGrid } from "@/components/sections/portfolio-filter-grid";
import { portfolioSites } from "@/lib/portfolio-sites";

type Props = { params: { locale: string } };

export default async function RealisationsPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.realisations");

  const projects = [0, 1, 2, 3].map((i) => ({
    title: t(`items.${i}.title`),
    category: t(`items.${i}.category`),
    body: t(`items.${i}.body`),
  }));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      {portfolioSites.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-primary">{t("websitesTitle")}</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">{t("websitesDescription")}</p>
          <div className="mt-8">
            <PortfolioFilterGrid sites={portfolioSites} />
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.title}
              className="rounded-3xl border border-primary/10 bg-background p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/50">
                {project.category}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary">{project.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{project.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Button asChild variant="accent">
            <Link href="/ressources/devis">{t("cta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
