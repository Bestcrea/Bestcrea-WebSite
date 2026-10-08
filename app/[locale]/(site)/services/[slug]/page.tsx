import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { pickLocale, pickLocaleList } from "@/lib/i18n-content";
import { serviceTechStacks } from "@/lib/tech-icons";
import { ServiceExpertise } from "@/components/sections/service-expertise";
import { ServiceProcess } from "@/components/sections/service-process";
import { ServiceSupport } from "@/components/sections/service-support";
import { ServiceQuoteCta } from "@/components/sections/service-quote-cta";
import { routing } from "@/i18n/routing";

type Props = {
  params: { locale: string; slug: string };
};

export default async function ServiceSlugPage({ params }: Props) {
  setRequestLocale(params.locale);

  const service = await prisma.service.findFirst({
    where: { slug: params.slug, isActive: true },
  });

  if (!service) {
    notFound();
  }

  const t = await getTranslations("Pages.services");
  const title = pickLocale(service.title as never, params.locale);
  const excerpt = pickLocale(service.excerpt as never, params.locale);
  const description = pickLocale(service.description as never, params.locale);
  const features = pickLocaleList(service.features, params.locale);
  const techStack = serviceTechStacks[service.slug] ?? [];

  return (
    <>
      <PageHero
        eyebrow={t("eyebrow")}
        title={title}
        description={excerpt}
        ctaHref="/ressources/devis"
        ctaLabel={t("cta")}
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold text-primary">{t("overview")}</h2>
          <p className="mt-4 whitespace-pre-line text-muted-foreground leading-relaxed">
            {description}
          </p>

          {techStack.length > 0 ? (
            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/50">
                {t("technologiesTitle")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {techStack.map(({ Icon, bg, fg, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 rounded-full border border-primary/10 bg-white px-2.5 py-1.5 shadow-sm"
                  >
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-md ${bg} ${fg}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="text-xs font-medium text-primary/80">{label}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <aside className="h-fit rounded-3xl border border-primary/10 bg-primary p-6 text-primary-foreground">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
            Bestcrea
          </p>
          <h3 className="mt-3 text-xl font-semibold">{t("asideTitle")}</h3>
          <p className="mt-3 text-sm text-primary-foreground/75">{t("asideCopy")}</p>
          <Button asChild variant="accent" className="mt-6 w-full">
            <Link href="/contact">{t("contactCta")}</Link>
          </Button>
        </aside>
      </section>

      <ServiceExpertise
        title={t("expertiseTitle")}
        description={t("expertiseDescription")}
        features={features}
      />

      <ServiceProcess />

      <ServiceSupport />

      <ServiceQuoteCta />
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  if (!routing.locales.includes(params.locale as never)) return {};
  const service = await prisma.service.findFirst({
    where: { slug: params.slug, isActive: true },
  });
  if (!service) return {};
  return {
    title: pickLocale(service.title as never, params.locale),
    description: pickLocale(service.excerpt as never, params.locale),
  };
}
