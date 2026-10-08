"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const STATUSES: [string, string][] = [
  ["new", "Nouvelle"],
  ["in_review", "En étude"],
  ["quoted", "Devisée"],
  ["closed", "Clôturée"],
  ["cancelled", "Annulée"],
];

export function RequestStatusForm({ id, status, internalNotes }: { id: string; status: string; internalNotes: string }) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [notes, setNotes] = useState(internalNotes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const response = await fetch(`/api/admin/quote-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s, internalNotes: notes }),
    });
    setBusy(false);
    setMsg(response.ok ? "Enregistré." : "Erreur");
    if (response.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-4">
      <p className="text-sm font-medium">Suivi interne</p>
      <select value={s} onChange={(e) => setS(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
        {STATUSES.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Notes internes (jamais visibles par le client)" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="accent" disabled={busy}>Enregistrer</Button>
        {msg ? <span className="text-sm text-muted-foreground">{msg}</span> : null}
      </div>
    </form>
  );
}
