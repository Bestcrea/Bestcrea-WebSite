"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localesMeta } from "@/lib/navigation";
import type { Locale } from "@/i18n/routing";
import { Flag } from "@/components/layout/flag";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  variant?: "default" | "dark" | "light" | "auth" | "portal";
  /** Render all languages as an always-visible chip list (used inside menus that clip popovers). */
  inline?: boolean;
};

export function LanguageSwitcher({
  className,
  variant = "default",
  inline = false,
}: LanguageSwitcherProps) {
  const t = useTranslations("Navigation");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = localesMeta.find((item) => item.code === locale) ?? localesMeta[0];

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function switchLocale(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    // Keep the current page AND its query string (e.g. ?token=… on PayPal return).
    const query: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      const prev = query[key];
      query[key] = prev === undefined ? value : Array.isArray(prev) ? [...prev, value] : [prev, value];
    });
    router.replace({ pathname, query } as never, { locale: next });
  }

  if (inline) {
    return (
      <div role="radiogroup" aria-label={t("language")} className={cn("flex flex-wrap gap-1.5", className)}>
        {localesMeta.map((item) => (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={item.code === locale}
            lang={item.code}
            onClick={() => switchLocale(item.code)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
              item.code === locale
                ? "border-[#7A35FF] bg-[#7A35FF]/10 text-[#6A2BE0]"
                : "border-neutral-200 text-neutral-700 hover:border-[#7A35FF]/50 hover:bg-neutral-50"
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
    );
  }

  const triggerClass =
    variant === "portal"
      ? "border-neutral-200 bg-white text-neutral-800 hover:border-[#7A35FF]/50 hover:bg-neutral-50"
      : variant === "dark"
      ? "border-white/15 bg-transparent text-white hover:border-white/30 hover:bg-white/5"
      : variant === "auth"
        ? "border-primary/10 bg-white text-primary shadow-sm hover:border-accent hover:text-accent"
        : variant === "light"
        ? "border-black/10 bg-transparent text-[#292D32] hover:bg-black/5"
        : "border-primary/10 bg-background/70 text-primary hover:border-accent/60 hover:bg-accent/10";

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={t("language")}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors",
          triggerClass
        )}
      >
        <Flag locale={current.code} />
        <span>{variant === "portal" ? current.name : current.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="absolute end-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-primary/10 bg-background text-foreground shadow-xl shadow-primary/10">
          <ul className="py-1" role="listbox" aria-label={t("language")}>
            {localesMeta.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.code === locale}
                  lang={item.code}
                  onClick={() => switchLocale(item.code)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-accent/20",
                    item.code === locale && "bg-primary/5 font-semibold text-primary"
                  )}
                >
                  <Flag locale={item.code} />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
