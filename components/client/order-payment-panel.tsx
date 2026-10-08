"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, MessageCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  method: string;
  paymentStatus: string;
  instructions: string[];
  whatsapp?: { url: string; label: string };
  currentReference: string | null;
  hasProof: boolean;
  paymentId: string | null;
  locale: string;
};

/** Pending-payment actions on a client's order: PayPal return/retry, reference + proof upload. */
export function OrderPaymentPanel({ orderId, method, paymentStatus, instructions, whatsapp, currentReference, hasProof, paymentId, locale }: Props) {
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
    if (method !== "paypal" || !token || captured.current || paymentStatus === "confirmed") return;
    captured.current = true;
    setBusy(true);
    fetch("/api/checkout/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, token }),
    })
      .then(async (r) => ({ ok: r.ok, data: (await r.json().catch(() => null)) as { error?: string } | null }))
      .then(({ ok, data }) => {
        setMessage({ ok, text: ok ? "Paiement PayPal confirmé. Merci !" : data?.error || "Vérification impossible." });
        router.replace(`/espace-client/commandes/${orderId}`);
        router.refresh();
      })
      .finally(() => setBusy(false));
  }, [params, method, orderId, paymentStatus, router]);

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
    setMessage({ ok: false, text: data?.error || "Erreur PayPal." });
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
    if (!res.ok) return setMessage({ ok: false, text: data?.error || "Erreur" });
    setFile(null);
    setMessage({ ok: true, text: "Justificatif envoyé. Nous vérifions votre paiement." });
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/10 bg-background p-5">
      <h2 className="font-semibold text-primary">Paiement</h2>
      <ul className="space-y-1 text-sm">{instructions.map((l) => <li key={l}>{l}</li>)}</ul>
      {whatsapp ? (
        <a href={whatsapp.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <MessageCircle className="h-4 w-4" /> {whatsapp.label}
        </a>
      ) : null}

      {method === "paypal" ? (
        <Button variant="accent" onClick={retryPaypal} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Payer avec PayPal
        </Button>
      ) : (
        <form onSubmit={submitProof} className="grid gap-3 border-t pt-4 sm:grid-cols-2">
          <label className="block text-xs font-medium text-muted-foreground">
            Référence du paiement
            <input value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Justificatif (PDF, JPG, PNG — 5 Mo max)
            <span className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-sm hover:border-accent">
              <Upload className="h-4 w-4" /> {file ? file.name : hasProof ? "Remplacer le justificatif" : "Choisir un fichier"}
              <input type="file" accept="application/pdf,image/png,image/jpeg" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </span>
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" variant="accent" disabled={busy || (!file && !reference.trim())}>{busy ? "Envoi…" : "Envoyer"}</Button>
            {hasProof && paymentId ? (
              <a href={`/api/payments/${paymentId}/proof`} target="_blank" rel="noreferrer" className="text-sm text-accent underline">Voir mon justificatif</a>
            ) : null}
          </div>
        </form>
      )}
      {message ? <p className={message.ok ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message.text}</p> : null}
    </div>
  );
}
