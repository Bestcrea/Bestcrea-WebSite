"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Upload } from "lucide-react";
import { PaymentCard } from "@/components/checkout/payment-details";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  method: string;
  paymentStatus: string;
  instructions: string[];
  whatsapp?: { url: string; label: string };
  logo: string;
  label: string;
  amount: string;
  /** True only for the automatic PayPal checkout (API keys configured). */
  paypalFlow?: boolean;
  currentReference: string | null;
  hasProof: boolean;
  paymentId: string | null;
  locale: string;
};

/** Pending-payment actions on a client's order: PayPal return/retry, reference + proof upload. */
export function OrderPaymentPanel({ orderId, method, paymentStatus, instructions, whatsapp, logo, label, amount, paypalFlow, currentReference, hasProof, paymentId, locale }: Props) {
  const t = useTranslations("Payment");
  const router = useRouter();
  const params = useSearchParams();
  const [reference, setReference] = useState(currentReference ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const captured = useRef(false);

  // Returning from PayPal: ?token=<paypal order id>. The server verifies the capture before marking paid.
  useEffect(() => {
    const token = params.get("token");
    if (!paypalFlow || !token || captured.current || paymentStatus === "confirmed") return;
    captured.current = true;
    setBusy(true);
    fetch("/api/checkout/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, token }),
    })
      .then(async (r) => ({ ok: r.ok, data: (await r.json().catch(() => null)) as { error?: string } | null }))
      .then(({ ok, data }) => {
        setMessage({ ok, text: ok ? t("paypalOk") : data?.error || t("verifyError") });
        router.replace(`/espace-client/commandes/${orderId}`);
        router.refresh();
      })
      .finally(() => setBusy(false));
  }, [params, method, orderId, paymentStatus, router, paypalFlow, t]);

  async function retryPaypal() {
    setBusy(true);
    const res = await fetch("/api/checkout/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, locale }),
    });
    const data = (await res.json().catch(() => null)) as { approveUrl?: string; error?: string } | null;
    if (res.ok && data?.approveUrl) {
      window.location.href = data.approveUrl;
      return;
    }
    setBusy(false);
    setMessage({ ok: false, text: data?.error || t("paypalError") });
  }

  async function submitProof(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const form = new FormData();
    if (file) form.append("proof", file);
    if (reference.trim()) form.append("reference", reference.trim());
    const res = await fetch(`/api/checkout/orders/${orderId}/proof`, { method: "POST", body: form });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    if (!res.ok) return setMessage({ ok: false, text: data?.error || t("error") });
    setFile(null);
    setMessage({ ok: true, text: t("proofSent") });
    router.refresh();
  }

  return (
    <PaymentCard logo={logo} label={label} amount={amount} lines={instructions} whatsapp={whatsapp}>
      {paypalFlow ? (
        <Button variant="accent" onClick={retryPaypal} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t("payPaypal")}
        </Button>
      ) : (
        <form onSubmit={submitProof} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-muted-foreground">
            {t("reference")}
            <input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} className="mt-1 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-[#7A35FF] focus:ring-2 focus:ring-[#7A35FF]/20" />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            {t("proofFile")}
            <span className="mt-1 flex cursor-pointer items-center gap-2 h-10 rounded-lg border border-dashed border-neutral-300 px-3 text-sm text-neutral-700 transition hover:border-[#7A35FF] hover:bg-[#7A35FF]/5">
              <Upload className="h-4 w-4" /> {file ? file.name : hasProof ? t("replaceProof") : t("chooseFile")}
              <input type="file" accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" variant="accent" disabled={busy || (!file && !reference.trim())}>{busy ? t("sending") : t("send")}</Button>
            {hasProof && paymentId ? (
              <a href={`/api/payments/${paymentId}/proof`} target="_blank" rel="noreferrer" className="text-sm text-accent underline">{t("viewProof")}</a>
            ) : null}
          </div>
        </form>
      )}
      {message ? <p className={message.ok ? "mt-3 text-sm text-emerald-700" : "mt-3 text-sm text-red-600"}>{message.text}</p> : null}
    </PaymentCard>
  );
}
