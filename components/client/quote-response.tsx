"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function QuoteResponse({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<null | "reject" | "modify">(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(action: "accept" | "reject" | "modify") {
    if (action === "accept" && !window.confirm("Accepter ce devis ? Un bon de commande sera généré.")) return;
    setBusy(true);
    setError("");
    const response = await fetch(`/api/client/quotes/${quoteId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, message }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Erreur");
    setMode(null);
    setMessage("");
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-2xl border border-primary/10 bg-background p-5">
      <div className="flex flex-wrap gap-2">
        <Button variant="accent" disabled={busy} onClick={() => send("accept")}>Accepter le devis</Button>
        <Button variant="outline" disabled={busy} onClick={() => setMode(mode === "modify" ? null : "modify")}>Demander une modification</Button>
        <Button variant="outline" disabled={busy} onClick={() => setMode(mode === "reject" ? null : "reject")}>Refuser</Button>
      </div>
      {mode ? (
        <div className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={mode === "reject" ? "Motif du refus (optionnel)" : "Décrivez les modifications souhaitées"}
            className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm"
          />
          <Button size="sm" variant="accent" disabled={busy} onClick={() => send(mode)}>
            {mode === "reject" ? "Confirmer le refus" : "Envoyer la demande"}
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
