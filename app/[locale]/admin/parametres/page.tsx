import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/settings-form";

type Props = { params: { locale: string } };

const defaults = {
  seo: {
    siteName: "Bestcrea",
    defaultTitle: "Bestcrea — Agence digitale premium",
    defaultDescription: "Design, développement, SaaS et automatisation.",
  },
  smtp: { host: "", port: 587, user: "", from: "contact@bestcrea.com" },
  apiKeys: { openai: "", maps: "", analytics: "" },
  colors: { primary: "#292D32", accent: "#7A35FF", background: "#F0F2F5" },
};

export default async function AdminParametresPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const page = await prisma.pageContent.findUnique({
    where: { key: "site.settings" },
  });
  const settings =
    page?.content && typeof page.content === "object"
      ? { ...defaults, ...(page.content as object) }
      : defaults;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          SEO, SMTP, clés API et couleurs de marque.
        </p>
      </div>
      <SettingsForm initial={settings as typeof defaults} />
    </div>
  );
}
