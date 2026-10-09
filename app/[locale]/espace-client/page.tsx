import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { FileText, FolderKanban, LayoutDashboard, LifeBuoy, type LucideIcon } from "lucide-react";
import { StatusPill } from "@/components/client/status-pill";
import { PortalBanner } from "@/components/client/portal-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientDashboardPage(props: Props) {
  const params = await props.params;
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
      <PortalBanner icon={LayoutDashboard} title={t("title")} description={t("description")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={FolderKanban} label={t("stats.projects")} value={String(projects.length)} hint={t("stats.active", { count: activeProjects })} />
        <Stat icon={FileText} label={t("stats.invoices")} value={String(invoices.length)} hint={t("stats.unpaid", { count: unpaid })} warn={unpaid > 0} />
        <Stat icon={LifeBuoy} label={t("stats.tickets")} value={String(tickets)} hint={t("stats.openTickets")} />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("recentProjects")} href="/espace-client/projets" seeAll={t("seeAll")}>
          {projects.length === 0 ? (
            <Empty icon={FolderKanban} text={t("noProjects")} />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link href={`/espace-client/projets/${project.slug}`} className="block px-5 py-3.5 transition hover:bg-neutral-50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-medium text-neutral-900">{pickLocale(project.title as never, params.locale)}</p>
                      <StatusPill status={project.status} />
                    </div>
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <div className="h-full rounded-full bg-[#7A35FF]" style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }} />
                      </div>
                      <span className="text-xs tabular-nums text-neutral-500">{project.progress}%</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("recentInvoices")} href="/espace-client/factures" seeAll={t("seeAll")}>
          {invoices.length === 0 ? (
            <Empty icon={FileText} text={t("noInvoices")} />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-900">{invoice.reference}</p>
                    <p className="truncate text-sm text-neutral-500">{invoice.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <p className="font-semibold tabular-nums text-neutral-900">{Number(invoice.totalAmount).toFixed(2)} {invoice.currency}</p>
                    <StatusPill status={invoice.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, warn }: { icon: LucideIcon; label: string; value: string; hint: string; warn?: boolean }) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7A35FF]/10 text-[#7A35FF]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-2xl font-semibold leading-tight tabular-nums text-neutral-900">{value}</p>
        <p className={warn ? "text-xs font-medium text-amber-700" : "text-xs text-neutral-500"}>{hint}</p>
      </div>
    </article>
  );
}

function Panel({ title, href, seeAll, children }: { title: string; href: string; seeAll: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
        <h2 className="font-semibold text-neutral-900">{title}</h2>
        <Link href={href} className="text-sm font-medium text-[#7A35FF] hover:underline">{seeAll}</Link>
      </header>
      {children}
    </section>
  );
}

function Empty({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-sm text-neutral-500">
      <Icon className="h-8 w-8 text-neutral-300" />
      {text}
    </div>
  );
}
