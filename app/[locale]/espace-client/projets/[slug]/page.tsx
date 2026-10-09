import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";

type Milestone = {
  id?: string;
  title: string;
  status: string;
  dueDate?: string | null;
};

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ClientProjectDetailPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const project = await prisma.project.findFirst({
    where: {
      slug: params.slug,
      ...(session.user.role === "admin" ? {} : { clientId: session.user.id }),
    },
  });

  if (!project) notFound();

  const t = await getTranslations("ClientPortal.projects");
  const milestones = (Array.isArray(project.milestones) ? project.milestones : []) as Milestone[];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/espace-client/projets" className="text-sm font-medium text-primary underline">
          ← {t("back")}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold text-primary">
          {pickLocale(project.title as never, params.locale)}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {pickLocale(project.description as never, params.locale)}
        </p>
      </div>

      <div className="rounded-3xl border border-primary/10 bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-primary">{t("progress")}</h2>
          <span className="text-sm text-muted-foreground">{project.progress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-primary/10">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs uppercase tracking-wide text-primary/50">{project.status}</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-primary">{t("milestones")}</h2>
        <ul className="mt-4 space-y-3">
          {milestones.length === 0 ? (
            <li className="text-sm text-muted-foreground">{t("noMilestones")}</li>
          ) : (
            milestones.map((m, index) => (
              <li
                key={m.id || `${m.title}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-primary/10 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-primary">{m.title}</p>
                  {m.dueDate ? (
                    <p className="text-xs text-muted-foreground">
                      {t("due")} {new Date(m.dueDate).toLocaleDateString(params.locale)}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary/60">
                  {m.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
