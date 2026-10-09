"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, X } from "lucide-react";

/** ❌ button with inline confirmation: cancels an unpaid order. */
export function CancelOrderButton({ orderId, number }: { orderId: string; number: string }) {
  const t = useTranslations("Orders");
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function cancel() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/client/orders/${orderId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return setError(t("cancelError"));
    setConfirm(false);
    router.refresh();
  }

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        aria-label={`${t("cancel")} ${number}`}
        title={t("cancel")}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <X className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div role="alertdialog" aria-label={t("confirmTitle")} className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm">
      <span className="text-red-800">{t("confirmText", { number })}</span>
      <button type="button" onClick={cancel} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null} {t("yes")}
      </button>
      <button type="button" onClick={() => setConfirm(false)} disabled={busy} className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
        {t("no")}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
