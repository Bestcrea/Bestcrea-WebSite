import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { ContentEditor } from "@/components/admin/content-editor";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminContenuPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  let pages = await prisma.pageContent.findMany({ orderBy: { key: "asc" } });

  if (pages.length === 0) {
    await prisma.pageContent.create({
      data: {
        key: "home",
        title: {
          fr: "Accueil",
          en: "Home",
          ar: "الرئيسية",
          es: "Inicio",
          de: "Startseite",
        },
        seoDescription: {
          fr: "Bestcrea — agence digitale premium",
          en: "Bestcrea — premium digital agency",
          ar: "Bestcrea",
          es: "Bestcrea",
          de: "Bestcrea",
        },
        content: {
          fr: { hero: "Construisez l'expérience digitale qui fait grandir votre marque" },
          en: { hero: "Build the digital experience that grows your brand" },
          ar: { hero: "Bestcrea" },
          es: { hero: "Bestcrea" },
          de: { hero: "Bestcrea" },
        },
        isPublished: true,
      },
    });
    pages = await prisma.pageContent.findMany({ orderBy: { key: "asc" } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contenu</h1>
        <p className="text-sm text-muted-foreground">
          Édition PageContent par section et par langue.
        </p>
      </div>
      <ContentEditor
        pages={pages.map((p) => ({
          id: p.id,
          key: p.key,
          title: (p.title || {}) as Record<string, string>,
          seoDescription: (p.seoDescription || null) as Record<string, string> | null,
          content: (p.content || {}) as Record<string, unknown>,
          isPublished: p.isPublished,
        }))}
      />
    </div>
  );
}
