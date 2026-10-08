import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function ComingSoonNotice() {
  const t = useTranslations("Pages.resources.comingSoon");

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-[#292D32]/10 bg-[#F0F2F5] p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#7A35FF] shadow-sm">
        <Sparkles className="h-5 w-5" aria-hidden />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-[#292D32]">{t("title")}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#292D32]/70">{t("description")}</p>
      <Link
        href="/contact"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[#7A35FF] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
