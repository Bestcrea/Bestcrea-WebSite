import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Lock } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type Props = { children: ReactNode; params: { locale: string } };

/** Distraction-free layout for checkout: logo, security hint, language switcher. */
export default function CheckoutLayout({ children, params }: Props) {
  setRequestLocale(params.locale);
  return (
    <div className="min-h-screen bg-[#f7f7f9]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-xs text-neutral-500 sm:flex">
              <Lock className="h-3.5 w-3.5" /> Paiement sécurisé
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
