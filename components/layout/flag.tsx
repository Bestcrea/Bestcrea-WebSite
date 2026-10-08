import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

type FlagProps = {
  locale: Locale;
  className?: string;
};

const flagPaths: Record<Locale, ReactNode> = {
  fr: (
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#002395" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </>
  ),
  en: (
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.5" />
    </>
  ),
  ar: (
    <>
      {/* Morocco — red field with green star */}
      <rect width="24" height="16" fill="#C1272D" />
      <polygon
        points="12,3.2 13.05,6.55 16.6,6.55 13.7,8.55 14.8,11.9 12,9.85 9.2,11.9 10.3,8.55 7.4,6.55 10.95,6.55"
        fill="#006233"
      />
    </>
  ),
  es: (
    <>
      <rect width="24" height="16" fill="#AA151B" />
      <rect y="4" width="24" height="8" fill="#F1BF00" />
    </>
  ),
  de: (
    <>
      <rect width="24" height="5.33" fill="#000" />
      <rect y="5.33" width="24" height="5.34" fill="#D00" />
      <rect y="10.67" width="24" height="5.33" fill="#FFCE00" />
    </>
  ),
};

export function Flag({ locale, className }: FlagProps) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={cn("h-3.5 w-5 overflow-hidden rounded-[2px] shadow-sm", className)}
      aria-hidden
    >
      {flagPaths[locale]}
    </svg>
  );
}
