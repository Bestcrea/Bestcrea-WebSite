"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowUpRight,
  BarChart3,
  Bot,
  BookOpen,
  Briefcase,
  Cloud,
  Code2,
  CreditCard,
  Cpu,
  FileText,
  Globe2,
  LifeBuoy,
  Mail,
  MapPin,
  Newspaper,
  Package,
  Palette,
  PenLine,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Star,
  Terminal,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DiHtml5,
  DiCss3,
  DiJava,
  DiPhp,
} from "react-icons/di";
import { SiJavascript, SiLaravel } from "react-icons/si";
import { Link } from "@/i18n/navigation";
import type { MegaGroup, MegaPromo } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const techIcons = [
  { Icon: SiJavascript, bg: "bg-[#F7DF1E]", fg: "text-[#292D32]", rotate: -8 },
  { Icon: DiJava, bg: "bg-white", fg: "text-[#EA2D2E]", rotate: 6 },
  { Icon: DiHtml5, bg: "bg-white", fg: "text-[#E44D26]", rotate: -5 },
  { Icon: DiCss3, bg: "bg-white", fg: "text-[#2965F1]", rotate: 9 },
  { Icon: DiPhp, bg: "bg-white", fg: "text-[#777BB4]", rotate: -10 },
  { Icon: SiLaravel, bg: "bg-white", fg: "text-[#FF2D20]", rotate: 7 },
] as const;

const icons: Record<string, LucideIcon> = {
  code: Code2,
  smartphone: Smartphone,
  cloud: Cloud,
  globe: Globe2,
  refresh: RefreshCw,
  bot: Bot,
  palette: Palette,
  search: Search,
  server: Server,
  book: BookOpen,
  briefcase: Briefcase,
  file: FileText,
  lifeBuoy: LifeBuoy,
  pen: PenLine,
  wallet: Wallet,
  users: Users,
  creditCard: CreditCard,
  cpu: Cpu,
  newspaper: Newspaper,
  terminal: Terminal,
  chart: BarChart3,
  shield: ShieldCheck,
  map: MapPin,
  package: Package,
  mail: Mail,
  star: Star,
};

type MegaMenuPanelProps = {
  labelKey: string;
  groups: MegaGroup[];
  promo: MegaPromo;
  onNavigate?: () => void;
  className?: string;
};

export function MegaMenuPanel({
  labelKey,
  groups,
  promo,
  onNavigate,
  className,
}: MegaMenuPanelProps) {
  const t = useTranslations("Navigation");
  const [activeKey, setActiveKey] = useState(groups[0]?.key ?? "");
  const activeGroup = groups.find((g) => g.key === activeKey) ?? groups[0];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl shadow-black/10",
        className
      )}
      onMouseLeave={() => setActiveKey(groups[0]?.key ?? "")}
    >
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        {/* Left: categories */}
        <aside className="border-b border-black/5 bg-[#F0F2F5] p-3 lg:border-b-0 lg:border-e lg:border-black/5">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#292D32]/45">
            {t(labelKey)}
          </p>
          <ul className="space-y-0.5">
            {groups.map((group) => {
              const Icon = icons[group.icon ?? "code"] ?? Code2;
              const active = group.key === activeGroup?.key;
              return (
                <li key={group.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveKey(group.key)}
                    onFocus={() => setActiveKey(group.key)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-full px-3 py-2.5 text-start text-sm transition-colors",
                      active
                        ? "bg-white font-semibold text-[#292D32] shadow-sm"
                        : "text-[#292D32]/70 hover:bg-white/60 hover:text-[#292D32]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-80" />
                    <span>{t(group.key)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Middle: 2-col item grid */}
        <div className="p-4 sm:p-5">
          <div className="grid gap-1 sm:grid-cols-2">
            {activeGroup?.items.map((item) => {
              const Icon = icons[item.icon ?? "code"] ?? Code2;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={onNavigate}
                  className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-[#F0F2F5]"
                >
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#F0F2F5] text-[#292D32] transition-colors group-hover:bg-[#7A35FF] group-hover:text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#292D32]">
                      {t(item.key)}
                    </span>
                    {item.descriptionKey ? (
                      <span className="mt-0.5 block text-xs leading-relaxed text-[#292D32]/55">
                        {t(item.descriptionKey)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: promo card */}
        <div className="border-t border-white/10 p-4 lg:border-s lg:border-t-0 lg:p-5">
          <div className="relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#5a2a6b] via-[#292D32] to-[#1a0a22] p-5 ring-1 ring-white/10">
            <div
              className="pointer-events-none absolute -end-8 top-8 h-32 w-32 rounded-full bg-[#7A35FF]/15 blur-2xl"
              aria-hidden
            />
            <div className="relative flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A35FF]">
                {t(promo.eyebrowKey)}
              </p>
              <ArrowUpRight className="h-4 w-4 text-white/50" aria-hidden />
            </div>
            <div className="relative mt-6 flex-1">
              <div className="mb-5 h-24">
                {labelKey === "services" ? (
                  <div className="flex h-full flex-col justify-center gap-3">
                    <div className="flex justify-between pe-6">
                      {techIcons.slice(0, 3).map(({ Icon, bg, fg, rotate }, i) => (
                        <motion.span
                          key={i}
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-md",
                            bg,
                            fg
                          )}
                          style={{ rotate }}
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.18,
                          }}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </motion.span>
                      ))}
                    </div>
                    <div className="flex justify-between ps-6">
                      {techIcons.slice(3, 6).map(({ Icon, bg, fg, rotate }, i) => (
                        <motion.span
                          key={i}
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-md",
                            bg,
                            fg
                          )}
                          style={{ rotate }}
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 2.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: (i + 3) * 0.18,
                          }}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </motion.span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative flex h-full items-end justify-center">
                    {[
                      { Icon: PenLine, x: -34, rotate: -14, z: 0 },
                      { Icon: BookOpen, x: 0, rotate: 0, z: 2 },
                      { Icon: FileText, x: 34, rotate: 14, z: 1 },
                    ].map(({ Icon, x, rotate, z }, i) => (
                      <motion.span
                        key={i}
                        className="absolute grid h-14 w-11 place-items-center rounded-xl bg-gradient-to-b from-white to-white/80 text-[#7A35FF] shadow-lg"
                        style={{ zIndex: z }}
                        initial={{ x, rotate, y: 6 }}
                        animate={{ y: [6, -2, 6], x, rotate }}
                        transition={{
                          duration: 2.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.25,
                        }}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-base font-semibold leading-snug text-white">
                {t(promo.titleKey)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                {t(promo.descriptionKey)}
              </p>
            </div>
            <Link
              href={promo.href}
              onClick={onNavigate}
              className="relative mt-5 inline-flex h-10 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#292D32] transition-colors hover:bg-[#7A35FF] hover:text-white"
            >
              {t(promo.ctaKey)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
