"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function HeaderDomainSearch({ className }: { className?: string }) {
  const t = useTranslations("HomePage.domain");
  const tNav = useTranslations("Navigation");
  const router = useRouter();
  const [domain, setDomain] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = domain.trim();
    if (!q) return;
    router.push(`/domaine?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className={cn("border-t border-white/10 bg-[#2a1233]", className)}>
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
          <label htmlFor="header-domain-input" className="sr-only">
            {t("label")}
          </label>
          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-lg shadow-black/20 sm:gap-3 sm:p-1.5">
            <Search
              className="ms-3 h-4 w-4 shrink-0 text-[#292D32]/40 sm:ms-4 sm:h-5 sm:w-5"
              aria-hidden
            />
            <input
              id="header-domain-input"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder={t("placeholder")}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#292D32] outline-none placeholder:text-[#292D32]/40 sm:text-base"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!domain.trim()}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#7A35FF] px-3.5 text-sm font-semibold text-[#FFFFFF] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-5"
            >
              <span className="hidden sm:inline">{tNav("domainSearchCta")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180 sm:hidden" aria-hidden />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
