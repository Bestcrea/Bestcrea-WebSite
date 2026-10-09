"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  MessageCircle,
  BarChart3,
  Bot,
  BookOpen,
  Briefcase,
  Building2,
  ChevronRight,
  Cloud,
  Code2,
  CreditCard,
  Cpu,
  FileText,
  Globe2,
  Home,
  LifeBuoy,
  Mail,
  MapPin,
  Newspaper,
  Package,
  Palette,
  PenLine,
  PhoneCall,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Star,
  Tag,
  Terminal,
  User,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { OPEN_CHAT_EVENT } from "@/lib/chat-events";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import {
  resourceMegaGroups,
  serviceMegaGroups,
  type MegaGroup,
  type MegaItem,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

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

type MobileLevel =
  | { kind: "root" }
  | { kind: "groups"; section: "services" | "resources"; title: string }
  | {
      kind: "items";
      section: "services" | "resources";
      title: string;
      items: MegaItem[];
    };

type MobileNavProps = {
  open: boolean;
  loggedIn?: boolean;
  isStaff?: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose, loggedIn = false, isStaff = false }: MobileNavProps) {
  const t = useTranslations("Navigation");
  const tChat = useTranslations("Chat");
  const [level, setLevel] = useState<MobileLevel>({ kind: "root" });

  useEffect(() => {
    if (!open) setLevel({ kind: "root" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.mobileMenu = "open"; // hides the floating chat button while the menu is open
    return () => {
      document.body.style.overflow = prev;
      delete document.body.dataset.mobileMenu;
    };
  }, [open]);

  function openGroups(section: "services" | "resources") {
    setLevel({
      kind: "groups",
      section,
      title: section === "services" ? t("services") : t("resources"),
    });
  }

  function openGroupItems(section: "services" | "resources", group: MegaGroup) {
    setLevel({
      kind: "items",
      section,
      title: t(group.key),
      items: group.items,
    });
  }

  function goBack() {
    if (level.kind === "items") {
      setLevel({
        kind: "groups",
        section: level.section,
        title: level.section === "services" ? t("services") : t("resources"),
      });
      return;
    }
    setLevel({ kind: "root" });
  }

  const groups: MegaGroup[] =
    level.kind !== "root"
      ? level.section === "services"
        ? serviceMegaGroups
        : resourceMegaGroups
      : [];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[90] bg-black/50 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("openMenu")}
        className={cn(
          "fixed inset-y-0 end-0 z-[100] flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
          !open && "pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-[#292D32] hover:bg-black/5"
            aria-label={t("closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {level.kind !== "root" ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 border-b border-black/5 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#292D32]"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            <span>{level.title}</span>
          </button>
        ) : null}

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {level.kind === "root" ? (
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-[#292D32] hover:bg-black/5"
                >
                  <span className="inline-flex items-center gap-3">
                    <Home className="h-5 w-5 opacity-70" />
                    {t("home")}
                  </span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openGroups("services")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-base font-semibold text-[#292D32] hover:bg-black/5"
                >
                  <span className="inline-flex items-center gap-3">
                    <Server className="h-5 w-5 opacity-70" />
                    {t("services")}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-40 rtl:rotate-180" />
                </button>
              </li>
              <li>
                <Link
                  href="/agence"
                  onClick={onClose}
                  className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-[#292D32] hover:bg-black/5"
                >
                  <span className="inline-flex items-center gap-3">
                    <Building2 className="h-5 w-5 opacity-70" />
                    {t("agency")}
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tarifs"
                  onClick={onClose}
                  className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-[#292D32] hover:bg-black/5"
                >
                  <span className="inline-flex items-center gap-3">
                    <Tag className="h-5 w-5 opacity-70" />
                    {t("tarifs")}
                  </span>
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openGroups("resources")}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-base font-semibold text-[#292D32] hover:bg-black/5"
                >
                  <span className="inline-flex items-center gap-3">
                    <BookOpen className="h-5 w-5 opacity-70" />
                    {t("resources")}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-40 rtl:rotate-180" />
                </button>
              </li>
              <li>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="flex items-center rounded-xl px-3 py-3.5 text-base font-semibold text-[#292D32] hover:bg-black/5"
                >
                  <span className="inline-flex items-center gap-3">
                    <PhoneCall className="h-5 w-5 opacity-70" />
                    {t("contact")}
                  </span>
                </Link>
              </li>
            </ul>
          ) : null}

          {level.kind === "groups" ? (
            <ul className="space-y-0.5">
              {groups.map((group) => {
                const Icon = icons[group.icon ?? "code"] ?? Code2;
                return (
                  <li key={group.key}>
                    <button
                      type="button"
                      onClick={() => openGroupItems(level.section, group)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-start hover:bg-black/5"
                    >
                      <span className="inline-flex items-center gap-3">
                        <Icon className="h-5 w-5 text-[#292D32]/70" />
                        <span className="text-base font-semibold text-[#292D32]">
                          {t(group.key)}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-40 rtl:rotate-180" />
                    </button>
                  </li>
                );
              })}
              <li className="border-t border-black/5 pt-1">
                <Link
                  href={level.section === "services" ? "/services" : "/ressources"}
                  onClick={onClose}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-[#292D32]/70 hover:bg-black/5"
                >
                  {level.section === "services"
                    ? t("viewAllServices")
                    : t("viewAllResources")}
                </Link>
              </li>
            </ul>
          ) : null}

          {level.kind === "items" ? (
            <ul className="space-y-0.5">
              {level.items.map((item) => {
                const Icon = icons[item.icon ?? "code"] ?? Code2;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex gap-3 rounded-xl px-3 py-3 hover:bg-black/5"
                    >
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#292D32]/70" />
                      <span>
                        <span className="block text-base font-semibold text-[#292D32]">
                          {t(item.key)}
                        </span>
                        {item.descriptionKey ? (
                          <span className="mt-0.5 block text-sm leading-snug text-black/50">
                            {t(item.descriptionKey)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className="sticky bottom-0 space-y-3 border-t border-black/10 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.setTimeout(() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT)), 200);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#292D32] px-3 py-3 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {tChat("open")}
            <span className="ms-1 flex items-center gap-0.5" aria-hidden>
              <i className="chat-dot !bg-white" />
              <i className="chat-dot !bg-white [animation-delay:.15s]" />
              <i className="chat-dot !bg-white [animation-delay:.3s]" />
            </span>
          </button>
          {loggedIn ? (
            <Link
              href={isStaff ? "/admin" : "/espace-client"}
              onClick={onClose}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7A35FF] px-3 py-3 text-sm font-semibold text-white"
            >
              <User className="h-4 w-4" aria-hidden />
              {t("clientSpace")}
            </Link>
          ) : (
          <div className="grid grid-cols-2 gap-2">
              <Link
                href="/espace-client/login"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-black/10 px-3 py-2.5 text-sm font-semibold text-[#292D32]"
              >
                {t("login")}
              </Link>
              <Link
                href="/espace-client/register"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl bg-[#7A35FF] px-3 py-2.5 text-sm font-semibold text-white"
              >
                {t("register")}
              </Link>
            </div>
          )}
          <LanguageSwitcher variant="light" placement="up" full />
        </div>
      </div>
    </>
  );
}
