import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: { locale: string } };

const sectionKeys = [
  "intro",
  "collecte",
  "finalites",
  "base",
  "partage",
  "cookies",
  "securite",
  "conservation",
  "droits",
  "transferts",
  "modifications",
  "contact",
] as const;

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildPageMetadata({ locale: params.locale, path: "ressources/politique-confidentialite" });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.privacy");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar table of contents */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/50">
                {t("tocTitle")}
              </p>
              <nav className="mt-4">
                <ul className="space-y-2.5">
                  {sectionKeys.map((key) => (
                    <li key={key}>
                      <a
                        href={`#${key}`}
                        className="text-sm text-primary/70 transition-colors hover:text-[#7A35FF]"
                      >
                        {t(`sections.${key}.title`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0">
            <div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-5 text-sm leading-relaxed text-muted-foreground">
              {t("note")}
            </div>
            <p className="mt-4 text-xs text-primary/40">
              {t("lastRevisedLabel")}: {t("lastRevisedDate")}
            </p>

            <div className="mt-8 space-y-10">
              {sectionKeys.map((key) => (
                <section key={key} id={key} className="scroll-mt-28">
                  <h2 className="text-xl font-semibold text-primary">
                    {t(`sections.${key}.title`)}
                  </h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    {t(`sections.${key}.body`)}
                  </p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
