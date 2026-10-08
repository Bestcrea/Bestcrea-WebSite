"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NewDeliveryNote({ orders }: { orders: { id: string; label: string }[] }) {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!orderId) return setError("Choisissez une commande.");
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/delivery-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, notes }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string; deliveryNote?: { id: string } } | null;
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Erreur");
    router.push(`/admin/bons-de-livraison/${data?.deliveryNote?.id}`);
  }

  const cls = "rounded-lg border px-3 py-2 text-sm";
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
      <p className="text-sm font-medium sm:col-span-4">Nouveau bon de livraison (depuis une commande)</p>
      <select value={orderId} onChange={(e) => setOrderId(e.target.value)} className={`${cls} sm:col-span-2`}>
        <option value="">— Commande —</option>
        {orders.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optionnel)" className={cls} maxLength={2000} />
      <Button type="submit" variant="accent" disabled={busy}>{busy ? "…" : "Créer"}</Button>
      {error ? <p className="text-sm text-red-600 sm:col-span-4">{error}</p> : null}
    </form>
  );
}
