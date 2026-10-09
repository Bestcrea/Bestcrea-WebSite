import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = {
  params: { locale: string };
};

const links = [
  { href: "/ressources/stories", key: "stories" },
  { href: "/ressources/realisations", key: "realisations" },
  { href: "/ressources/devis", key: "devis" },
  { href: "/ressources/aide-support", key: "aide" },
  { href: "/ressources/blog", key: "blog" },
] as const;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildPageMetadata({ locale: params.locale, path: "ressources", seoKey: "ressources" });
}

export default async function RessourcesPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-primary/10 bg-background p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-lg"
            >
              <h2 className="text-lg font-semibold text-primary">{t(`${item.key}.title`)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`${item.key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
