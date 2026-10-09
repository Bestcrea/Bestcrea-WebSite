import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { BlogManager } from "@/components/admin/blog-manager";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminBlogPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Blog / Ressources</h1>
        <p className="text-sm text-muted-foreground">
          CRUD articles avec champs SEO (titre, slug, meta description).
        </p>
      </div>
      <BlogManager
        locale={params.locale}
        posts={posts.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title as never,
          excerpt: p.excerpt as never,
          content: p.content as never,
          tags: p.tags,
          isPublished: p.isPublished,
        }))}
      />
    </div>
  );
}
