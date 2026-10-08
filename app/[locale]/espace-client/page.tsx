import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";

type Props = { params: { locale: string } };

export default async function ClientDashboardPage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const t = await getTranslations("ClientPortal.dashboard");
  const userId = session.user.id;

  const [projects, invoices, tickets] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.supportTicket.count({
      where: { requesterId: userId, status: { in: ["open", "in_progress", "waiting"] } },
    }),
  ]);

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const unpaid = invoices.filter((i) => i.status === "sent" || i.status === "overdue").length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold text-primary">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("stats.projects")} value={String(projects.length)} hint={t("stats.active", { count: activeProjects })} />
        <Stat label={t("stats.invoices")} value={String(invoices.length)} hint={t("stats.unpaid", { count: unpaid })} />
        <Stat label={t("stats.tickets")} value={String(tickets)} hint={t("stats.openTickets")} />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">{t("recentProjects")}</h2>
            <Link href="/espace-client/projets" className="text-sm font-medium text-primary underline">
              {t("seeAll")}
            </Link>
          </div>
          <ul className="space-y-3">
            {projects.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-primary/15 p-4 text-sm text-muted-foreground">
                {t("noProjects")}
              </li>
            ) : (
              projects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/espace-client/projets/${project.slug}`}
                    className="block rounded-2xl border border-primary/10 bg-background p-4 transition hover:border-accent"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-primary">
                        {pickLocale(project.title as never, params.locale)}
                      </p>
                      <span className="text-xs uppercase tracking-wide text-primary/50">
                        {project.status}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{project.progress}%</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">{t("recentInvoices")}</h2>
            <Link href="/espace-client/factures" className="text-sm font-medium text-primary underline">
              {t("seeAll")}
            </Link>
          </div>
          <ul className="space-y-3">
            {invoices.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-primary/15 p-4 text-sm text-muted-foreground">
                {t("noInvoices")}
              </li>
            ) : (
              invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="flex items-center justify-between rounded-2xl border border-primary/10 bg-background p-4"
                >
                  <div>
                    <p className="font-medium text-primary">{invoice.reference}</p>
                    <p className="text-sm text-muted-foreground">{invoice.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {Number(invoice.totalAmount).toFixed(2)} {invoice.currency}
                    </p>
                    <p className="text-xs uppercase text-primary/50">{invoice.status}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-3xl border border-primary/10 bg-primary p-5 text-primary-foreground">
      <p className="text-sm text-primary-foreground/70">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-accent">{value}</p>
      <p className="mt-2 text-xs text-primary-foreground/60">{hint}</p>
    </article>
  );
}
