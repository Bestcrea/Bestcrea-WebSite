import { Bell } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PortalBanner } from "@/components/client/portal-banner";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export default async function NotificationsPage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("ClientPortal.nav");
  const session = await requireClientSession();
  if (!session) return null;

  const items = await prisma.notification.findMany({
    where: { userId: session.user.id, audience: "client" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  // Opening the page marks everything as read.
  await prisma.notification.updateMany({
    where: { userId: session.user.id, audience: "client", readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="space-y-6">
      <PortalBanner icon={Bell} title={t("notifications")} />
      <div className="overflow-hidden rounded-3xl border bg-white">
        {items.length === 0 ? (
          <p className="p-10 text-center text-neutral-500">{t("noNotifications")}</p>
        ) : (
          <ul className="divide-y">
            {items.map((n) => {
              const body = (
                <div className="flex items-start gap-3 p-4 hover:bg-neutral-50">
                  <span className={n.readAt ? "mt-2 h-2 w-2 rounded-full bg-neutral-300" : "mt-2 h-2 w-2 rounded-full bg-[#7A35FF]"} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900">{n.title}</p>
                    {n.body ? <p className="mt-0.5 text-sm text-neutral-600">{n.body}</p> : null}
                    <p className="mt-1 text-xs text-neutral-400">{new Date(n.createdAt).toLocaleString(locale)}</p>
                  </div>
                </div>
              );
              return <li key={n.id}>{n.href ? <Link href={n.href as never}>{body}</Link> : body}</li>;
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
