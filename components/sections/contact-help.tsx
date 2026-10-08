import {
  Briefcase,
  FileText,
  LifeBuoy,
  Newspaper,
  User,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CARDS: { key: string; href: string; icon: LucideIcon }[] = [
  { key: "devis", href: "/ressources/devis", icon: FileText },
  { key: "espaceClient", href: "/espace-client", icon: User },
  { key: "support", href: "/ressources/aide-support", icon: LifeBuoy },
  { key: "ressources", href: "/ressources", icon: BookOpen },
  { key: "blog", href: "/ressources/blog", icon: Newspaper },
  { key: "carrieres", href: "/agence", icon: Briefcase },
];

export function ContactHelp() {
  const t = useTranslations("Pages.contact.help");

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-[#292D32] md:text-4xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-[#292D32]/70">
          {t("subtitle")}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="group rounded-2xl border border-[#292D32]/10 bg-[#F0F2F5] p-6 transition-colors hover:border-[#7A35FF]/40 hover:bg-white hover:shadow-md"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#7A35FF] shadow-sm transition-colors group-hover:bg-[#7A35FF] group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-[#292D32]">
                {t(`cards.${key}.title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#292D32]/70">
                {t(`cards.${key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
