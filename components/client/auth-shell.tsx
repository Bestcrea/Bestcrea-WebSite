import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

type Props = {
  title: string;
  text: string;
  children: ReactNode;
};

/** Split-screen auth layout: decorative brand panel on the left, form card on the right. */
export function AuthShell({ title, text, children }: Props) {
  const tFooter = useTranslations("Footer");
  return (
    <>
    <div
      style={{ fontFamily: 'var(--font-inter), system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' }}
      className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_20px_70px_-30px_rgba(122,53,255,0.35)]"
    >

      <div className="grid lg:grid-cols-2">
        {/* Brand panel */}
        <aside
          className="relative hidden overflow-hidden p-12 lg:block"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(122,53,255,0.14) 1.2px, transparent 1.4px), linear-gradient(160deg, #faf7ff 0%, #f3ecff 100%)",
            backgroundSize: "22px 22px, 100% 100%",
          }}
        >
          <div className="pointer-events-none absolute -start-24 top-48 h-72 w-72 rounded-full bg-accent/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 end-[-60px] h-72 w-72 rounded-full bg-accent/20 blur-2xl" />

          <div className="relative lg:sticky lg:top-10">
            <Logo />
            <h1 className="mt-20 max-w-sm text-5xl font-semibold leading-[1.1] tracking-tight text-primary">{title}</h1>
            <p className="mt-5 max-w-sm text-base text-primary/70">{text}</p>

          {/* Mini dashboard illustration (pure CSS, no external image) */}
          <div className="mt-14" aria-hidden="true">
            <div className="rounded-2xl border border-primary/10 bg-white/90 p-4 shadow-xl backdrop-blur">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-300" />
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: FileText, label: "Devis", value: "12" },
                  { icon: CheckCircle2, label: "Commandes", value: "8" },
                  { icon: BarChart3, label: "Factures", value: "21" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl bg-accent/5 p-3">
                    <Icon className="h-4 w-4 text-accent" />
                    <p className="mt-2 text-lg font-semibold text-primary">{value}</p>
                    <p className="text-[11px] text-primary/60">{label}</p>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 300 70" className="mt-3 h-16 w-full">
                <defs>
                  <linearGradient id="authArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7A35FF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7A35FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 55 C40 40 60 60 100 35 S170 45 210 20 S270 30 300 8 L300 70 L0 70 Z" fill="url(#authArea)" />
                <path d="M0 55 C40 40 60 60 100 35 S170 45 210 20 S270 30 300 8" fill="none" stroke="#7A35FF" strokeWidth="2" />
              </svg>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-primary/60">
              <ShieldCheck className="h-4 w-4 text-accent" /> Espace sécurisé · données chiffrées
            </p>
            </div>
          </div>
        </aside>

        {/* Form side */}
        <section className="flex flex-col px-4 py-6 sm:px-10 lg:py-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="ms-auto">
              <LanguageSwitcher variant="auth" />
            </div>
          </div>
          <div className="mx-auto w-full max-w-md rounded-3xl border border-primary/10 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </section>
      </div>
    </div>
    <p className="mt-6 text-center text-xs text-primary/50">
      © {new Date().getFullYear()} bestcrea.com - {tFooter("rights")}
    </p>
    </>
  );
}
