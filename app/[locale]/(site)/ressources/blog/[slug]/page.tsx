import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { routing } from "@/i18n/routing";

type Props = {
  params: { locale: string; slug: string };
};

export default async function BlogArticlePage({ params }: Props) {
  setRequestLocale(params.locale);

  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, isPublished: true },
  });

  if (!post) {
    notFound();
  }

  const t = await getTranslations("Pages.resources.blog");
  const title = pickLocale(post.title as never, params.locale);
  const excerpt = pickLocale(post.excerpt as never, params.locale);
  const content = pickLocale(post.content as never, params.locale);

  return (
    <>
      <PageHero
        eyebrow={
          post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString(params.locale)
            : t("eyebrow")
        }
        title={title}
        description={excerpt}
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-primary max-w-none whitespace-pre-line text-muted-foreground leading-relaxed">
          {content}
        </div>
        <p className="mt-12">
          <Link href="/ressources/blog" className="text-sm font-medium text-primary hover:underline">
            ← {t("back")}
          </Link>
        </p>
      </article>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  if (!routing.locales.includes(params.locale as never)) return {};
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, isPublished: true },
  });
  if (!post) return {};
  return {
    title: pickLocale(post.title as never, params.locale),
    description: pickLocale(post.excerpt as never, params.locale),
  };
}
