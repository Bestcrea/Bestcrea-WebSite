"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "bestcrea_promo_topbar_dismissed";

export function PromoTopBar() {
  const t = useTranslations("PromoTopBar");
  const pathname = usePathname();
  const isHome = pathname === "/";
  /** Whether the bar should be in the open visual state */
  const [open, setOpen] = useState(false);
  /** Whether we've read localStorage (avoid flash) */
  const [hydrated, setHydrated] = useState(false);
  /** Keep in DOM briefly while collapse animates */
  const [inDom, setInDom] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setOpen(false);
      setInDom(false);
      setHydrated(true);
      return;
    }

    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      dismissed = false;
    }

    setOpen(!dismissed);
    setInDom(!dismissed);
    setHydrated(true);
  }, [isHome]);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    window.setTimeout(() => setInDom(false), 320);
  }

  if (!isHome || !hydrated || !inDom) return null;

  return (
    <div
      className={cn(
        "grid bg-[#7A35FF] text-[#FFFFFF] transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="relative mx-auto flex min-h-10 max-w-7xl items-center justify-center px-10 py-2 sm:px-12">
          <p className="text-center text-xs font-semibold sm:text-sm">
            <span>{t("message")} </span>
            <Link
              href="/ressources/devis"
              className="underline underline-offset-2 transition-opacity hover:opacity-80"
            >
              {t("cta")}
            </Link>
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="absolute end-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[#292D32] transition-colors hover:bg-[#292D32]/10 sm:end-4"
            aria-label={t("close")}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
