"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE: Record<string, Tone> = {
  accepted: "success", paid: "success", payment_confirmed: "success", confirmed: "success", completed: "success", delivered: "success", resolved: "success", active: "success",
  pending: "warning", unpaid: "warning", partially_paid: "warning", awaiting_payment: "warning", waiting: "warning", in_review: "warning", on_hold: "warning", expired: "warning",
  rejected: "danger", overdue: "danger", failed: "danger",
  sent: "info", viewed: "info", payment_submitted: "info", submitted: "info", processing: "info", in_progress: "info", quoted: "info", new: "info", open: "info",
  draft: "neutral", cancelled: "neutral", closed: "neutral", refunded: "neutral",
};

const STYLE: Record<Tone, { box: string; dot: string }> = {
  success: { box: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", dot: "bg-emerald-500" },
  warning: { box: "bg-amber-50 text-amber-800 ring-amber-600/20", dot: "bg-amber-500" },
  danger: { box: "bg-red-50 text-red-700 ring-red-600/15", dot: "bg-red-500" },
  info: { box: "bg-[#7A35FF]/8 text-[#5B21B6] ring-[#7A35FF]/20", dot: "bg-[#7A35FF]" },
  neutral: { box: "bg-neutral-100 text-neutral-600 ring-neutral-500/15", dot: "bg-neutral-400" },
};

/** Localized status badge with a semantic color (green done, amber pending, red problem, violet in-flight). */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const t = useTranslations("Status");
  const s = STYLE[TONE[status] ?? "neutral"];
  const label = t.has(status as never) ? t(status as never) : status;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", s.box, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {label}
    </span>
  );
}
