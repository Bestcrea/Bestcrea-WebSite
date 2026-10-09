import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return buildPageMetadata({ locale: params.locale, path: "ressources/blog", seoKey: "blog" });
}

export default async function BlogIndexPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.blog");

  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/ressources/blog/${post.slug}`}
                className="rounded-3xl border border-primary/10 bg-background p-6 transition hover:-translate-y-1 hover:border-accent hover:shadow-lg"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/50">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString(params.locale)
                    : ""}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-primary">
                  {pickLocale(post.title as never, params.locale)}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {pickLocale(post.excerpt as never, params.locale)}
                </p>
                <span className="mt-5 inline-flex text-sm font-medium text-primary">
                  {t("readMore")} →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
