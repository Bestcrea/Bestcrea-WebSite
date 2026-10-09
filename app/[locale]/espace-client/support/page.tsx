import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireClientSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TicketForm } from "@/components/client/ticket-form";
import { LifeBuoy } from "lucide-react";
import { PortalBanner } from "@/components/client/portal-banner";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientSupportPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const session = await requireClientSession();
  if (!session) return null;

  const t = await getTranslations("ClientPortal.support");
  const tickets = await prisma.supportTicket.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <PortalBanner icon={LifeBuoy} title={t("title")} description={t("description")} />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <TicketForm />
        <div>
          <h2 className="mb-4 text-lg font-semibold text-primary">{t("myTickets")}</h2>
          <ul className="space-y-3">
            {tickets.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-primary/15 p-4 text-sm text-muted-foreground">
                {t("empty")}
              </li>
            ) : (
              tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="rounded-2xl border border-primary/10 bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-primary/50">
                        {ticket.reference}
                      </p>
                      <h3 className="mt-1 font-semibold text-primary">{ticket.subject}</h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="text-right text-xs uppercase tracking-wide text-primary/60">
                      <p>{ticket.status}</p>
                      <p className="mt-1">{ticket.priority}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
