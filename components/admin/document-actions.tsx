"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export type DocAction = {
  label: string;
  /** POST endpoint */
  url: string;
  body: Record<string, unknown>;
  confirm?: string;
  variant?: "accent" | "outline" | "destructive";
  /** Navigate here after success. `{id}` / `{number}` are replaced from the JSON response. */
  redirect?: string;
};

export function DocumentActions({ actions, pdfUrl }: { actions: DocAction[]; pdfUrl?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(a: DocAction) {
    if (a.confirm && !window.confirm(a.confirm)) return;
    setBusy(a.label);
    setError("");
    const response = await fetch(a.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a.body),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json().catch(() => null)) as Record<string, any> | null;
    setBusy(null);
    if (!response.ok) return setError(data?.error || "Erreur");

    if (a.redirect) {
      const target = a.redirect.replace("{id}", String(data?.quote?.id ?? data?.invoice?.id ?? data?.purchaseOrder?.id ?? data?.order?.id ?? ""));
      router.push(target);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {pdfUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={pdfUrl} target="_blank" rel="noreferrer">PDF</a>
          </Button>
        ) : null}
        {actions.map((a) => (
          <Button key={a.label} type="button" size="sm" variant={a.variant ?? "outline"} disabled={busy !== null} onClick={() => run(a)}>
            {busy === a.label ? "…" : a.label}
          </Button>
        ))}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

const METHODS: [string, string][] = [
  ["bank_cih", "Virement CIH"],
  ["bank_albarid", "Virement Al Barid Bank"],
  ["bank_chaabi", "Virement Banque Populaire / Chaabi"],
  ["ria", "RIA"],
  ["western_union", "Western Union"],
  ["cash_plus", "Cash Plus"],
  ["paypal", "PayPal"],
];

/** Record a (partial) payment against an invoice. */
export function RecordPaymentForm({ invoiceId, remaining, currency }: { invoiceId: string; remaining: number; currency: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState("bank_cih");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/invoices/${invoiceId}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "record_payment", amount: Number(amount), method, reference }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Erreur");
    setReference("");
    router.refresh();
  }

  const cls = "rounded-lg border px-3 py-2 text-sm";
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
      <p className="text-sm font-medium sm:col-span-4">Enregistrer un paiement (reste {remaining.toFixed(2)} {currency})</p>
      <input type="number" step="0.01" min="0.01" max={remaining} value={amount} onChange={(e) => setAmount(e.target.value)} className={cls} required />
      <select value={method} onChange={(e) => setMethod(e.target.value)} className={cls}>
        {METHODS.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Référence de paiement" className={cls} maxLength={120} />
      <Button type="submit" variant="accent" disabled={busy}>{busy ? "…" : "Valider le paiement"}</Button>
      {error ? <p className="text-sm text-red-600 sm:col-span-4">{error}</p> : null}
    </form>
  );
}
