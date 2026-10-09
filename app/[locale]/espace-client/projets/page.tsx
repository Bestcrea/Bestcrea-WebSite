import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { FolderKanban } from "lucide-react";
import { StatusPill } from "@/components/client/status-pill";
import { PortalBanner } from "@/components/client/portal-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientProjectsPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const t = await getTranslations("ClientPortal.projects");
  const projects = await prisma.project.findMany({
    where: { clientId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PortalBanner icon={FolderKanban} title={t("title")} description={t("description")} />
      <div className="grid gap-4 md:grid-cols-2">
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/espace-client/projets/${project.slug}`}
              className="rounded-3xl border border-primary/10 bg-background p-6 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-primary">
                  {pickLocale(project.title as never, params.locale)}
                </h2>
                <StatusPill status={project.status} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {pickLocale(project.description as never, params.locale)}
              </p>
              <div className="mt-5">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{t("progress")}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
