import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Page header banner used on every client-portal page (soft gradient, icon, title, description, action). */
export function PortalBanner({
  icon: Icon,
  title,
  description,
  eyebrow,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#7A35FF]/15 bg-gradient-to-br from-white via-[#F7F1FF] to-[#EBDDFF] p-6 sm:p-8">
      <div className="pointer-events-none absolute -end-10 -top-10 h-48 w-48 rounded-full bg-[#7A35FF]/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 end-24 h-40 w-40 rounded-full bg-[#FF6AD5]/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7A35FF]/10 text-[#7A35FF]">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A35FF]">{eyebrow}</p> : null}
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
            {description ? <p className="mt-1.5 max-w-2xl text-sm text-neutral-600 sm:text-base">{description}</p> : null}
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </section>
  );
}
