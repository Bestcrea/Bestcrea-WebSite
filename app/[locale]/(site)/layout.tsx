import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeferredChatWidget } from "@/components/chat/deferred-chat-widget";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default function SiteLayout({ children, params }: Props) {
  setRequestLocale(params.locale);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <DeferredChatWidget />
    </div>
  );
}
