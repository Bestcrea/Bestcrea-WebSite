import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminDashboardPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const [leads, projects, invoices, tickets, posts, services, clients] =
    await Promise.all([
      prisma.lead.count(),
      prisma.project.count(),
      prisma.invoice.count(),
      prisma.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: "client" } }),
    ]);

  const kpis = [
    { label: "Leads", value: leads },
    { label: "Clients", value: clients },
    { label: "Projets", value: projects },
    { label: "Factures", value: invoices },
    { label: "Tickets ouverts", value: tickets },
    { label: "Articles publiés", value: posts },
    { label: "Services actifs", value: services },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Vue d’ensemble Bestcrea — KPIs temps réel.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-primary/10 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
