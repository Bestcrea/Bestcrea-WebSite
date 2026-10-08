"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PaymentVerify({ paymentId, canVerify, isPaypal }: { paymentId: string; canVerify: boolean; isPaypal: boolean }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(action: "confirm" | "reject") {
    if (action === "confirm" && !window.confirm("Confirmer la réception du paiement ? Une facture payée sera créée.")) return;
    setBusy(action);
    setError("");
    const res = await fetch(`/api/admin/payments/${paymentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setBusy(null);
    if (!res.ok) return setError(data?.error || "Erreur");
    router.refresh();
  }

  if (!canVerify) return null;
  return (
    <div className="space-y-2">
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motif (en cas de refus)" maxLength={500} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="flex flex-wrap gap-2">
        {!isPaypal ? (
          <Button size="sm" variant="accent" disabled={busy !== null} onClick={() => run("confirm")}>{busy === "confirm" ? "…" : "Confirmer le paiement"}</Button>
        ) : null}
        <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run("reject")}>{busy === "reject" ? "…" : "Refuser"}</Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

const STATUS_OPTIONS: [string, string][] = [
  ["processing", "En traitement"],
  ["in_progress", "En cours"],
  ["completed", "Terminée"],
  ["cancelled", "Annulée"],
];

export function OrderStatusForm({ orderId, status, internalNotes }: { orderId: string; status: string; internalNotes: string }) {
  const router = useRouter();
  const [s, setS] = useState(STATUS_OPTIONS.some(([v]) => v === status) ? status : "");
  const [notes, setNotes] = useState(internalNotes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function save() {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(s ? { status: s } : {}), internalNotes: notes }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    setMsg(res.ok ? "Enregistré." : data?.error || "Erreur");
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border bg-white p-4">
      <p className="text-sm font-medium">Suivi de la commande</p>
      <select value={s} onChange={(e) => setS(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
        <option value="">— Statut inchangé —</option>
        {STATUS_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes internes" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3">
        <Button size="sm" variant="accent" onClick={save} disabled={busy}>Enregistrer</Button>
        {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
      </div>
    </div>
  );
}
