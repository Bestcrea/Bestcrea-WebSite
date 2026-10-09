import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/client/status-pill";
import { Receipt } from "lucide-react";
import { PortalBanner } from "@/components/client/portal-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientInvoicesPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const t = await getTranslations("ClientPortal.invoices");
  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id, status: { not: "draft" } },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { slug: true, title: true } } },
  });

  return (
    <div className="space-y-8">
      <PortalBanner icon={Receipt} title={t("title")} description={t("description")} />

      <div className="overflow-hidden rounded-3xl border border-primary/10 bg-background">
        {invoices.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-primary/10">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-primary">{invoice.reference}</p>
                  <p className="text-sm text-muted-foreground">{invoice.title}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <StatusPill status={invoice.status} />
                    {Number(invoice.paidTotal) > 0 && invoice.status !== "paid"
                      ? <span>{Number(invoice.paidTotal).toFixed(2)} / {Number(invoice.totalAmount).toFixed(2)}</span>
                      : null}
                    {invoice.issuedAt
                      ? <span>{new Date(invoice.issuedAt).toLocaleDateString(params.locale)}</span>
                      : null}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-primary">
                    {Number(invoice.totalAmount).toFixed(2)} {invoice.currency}
                  </p>
                  <Button asChild variant="accent" size="sm">
                    <a href={`/api/invoices/${invoice.id}/pdf`}>{t("downloadPdf")}</a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
