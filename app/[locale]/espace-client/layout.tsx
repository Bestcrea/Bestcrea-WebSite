import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { PortalShell } from "@/components/client/portal-shell";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ClientPortalLayout(props: Props) {
  const params = await props.params;
  const { children } = props;

  setRequestLocale(params.locale);
  const session = await requireClientSession();

  // Login / register pages render without the portal frame.
  if (!session) {
    return (
      <AuthSessionProvider>
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/[0.04] text-foreground">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </AuthSessionProvider>
    );
  }

  const unread = await prisma.notification
    .count({ where: { userId: session.user.id, audience: "client", readAt: null } })
    .catch(() => 0);

  return (
    <AuthSessionProvider>
      <PortalShell userName={session.user.name || ""} userEmail={session.user.email || ""} unread={unread}>
        {children}
      </PortalShell>
    </AuthSessionProvider>
  );
}
