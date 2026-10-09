import type { Metadata } from "next";
import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { requireClientSession } from "@/lib/session";
import { ClientPortalNav } from "@/components/client/portal-nav";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function ClientPortalLayout({ children, params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireClientSession();

  return (
    <AuthSessionProvider>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/[0.04] text-foreground">
        {session ? <ClientPortalNav userName={session.user.name} /> : null}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
