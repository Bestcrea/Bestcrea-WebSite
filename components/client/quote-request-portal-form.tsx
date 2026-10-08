"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ServiceOption = { id: string; title: string };

const BUDGETS = ["< 3 000 DH", "3 000 – 6 000 DH", "6 000 – 10 000 DH", "> 10 000 DH"];
const cls = "w-full rounded-xl border border-primary/15 bg-background px-3 py-2 text-sm";

export function PortalQuoteRequestForm({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [number, setNumber] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setError("");
    const raw = Object.fromEntries(new FormData(form).entries());
    const payload = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""));
    const response = await fetch("/api/client/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as { error?: string; request?: { number: string } } | null;
    if (!response.ok) {
      setState("idle");
      return setError(data?.error || "Une erreur est survenue.");
    }
    setNumber(data?.request?.number ?? "");
    setState("done");
    form.reset();
    router.refresh();
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
        <p className="font-semibold text-emerald-800">Demande {number} envoyée.</p>
        <p className="mt-1 text-emerald-700">Notre équipe vous répond avec un devis détaillé très prochainement.</p>
        <Button className="mt-3" variant="outline" size="sm" onClick={() => setState("idle")}>Nouvelle demande</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border border-primary/10 bg-background p-5 sm:grid-cols-2">
      <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
        Objet de la demande *
        <input name="title" required maxLength={200} className={cls} placeholder="Ex. Site e-commerce pour ma boutique" />
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Service
        <select name="serviceId" className={cls} defaultValue="">
          <option value="">— Non précisé —</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Budget estimé
        <select name="budget" className={cls} defaultValue="">
          <option value="">— Choisir —</option>
          {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
        Description du besoin *
        <textarea name="description" required rows={4} maxLength={5000} className={cls} />
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Quantité
        <input name="quantity" type="number" min="1" className={cls} />
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Délai souhaité
        <input name="desiredDeadline" type="date" className={cls} />
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
        Exigences particulières / remarques
        <textarea name="requirements" rows={2} maxLength={5000} className={cls} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" variant="accent" disabled={state === "sending"}>
          {state === "sending" ? "Envoi…" : "Envoyer la demande"}
        </Button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  );
}
