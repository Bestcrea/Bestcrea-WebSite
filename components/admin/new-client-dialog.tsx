"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LEGAL_STATUSES, LEGAL_STATUS_LABELS } from "@/lib/validators";

const input = "w-full rounded-lg border px-3 py-2 text-sm";

export function NewClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    const response = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; tempPassword?: string; client?: { email: string } }
      | null;
    setLoading(false);

    if (!response.ok || !payload?.tempPassword) {
      setError(payload?.error || "Impossible de créer le client.");
      return;
    }
    setCreated({ email: payload.client?.email ?? "", tempPassword: payload.tempPassword });
    router.refresh();
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCreated(null);
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="accent">
          <Plus className="h-4 w-4" /> Nouveau client
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nouveau client</DialogTitle>
          <DialogDescription>
            Un mot de passe temporaire sera généré ; communiquez-le au client de façon sécurisée.
          </DialogDescription>
        </DialogHeader>

        {created ? (
          <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-medium text-emerald-900">Client créé : {created.email}</p>
            <p>
              Mot de passe temporaire (affiché une seule fois) :{" "}
              <code className="rounded bg-white px-2 py-1 font-mono">{created.tempPassword}</code>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="firstName" required placeholder="Prénom *" className={input} />
              <input name="lastName" placeholder="Nom" className={input} />
              <input name="email" type="email" required placeholder="Email *" className={input} />
              <input name="phone" placeholder="Téléphone" className={input} />
              <input name="address" placeholder="Adresse" className={input} />
              <input name="city" placeholder="Ville" className={input} />
              <input name="company" placeholder="Société" className={input} />
              <select name="legalStatus" defaultValue="" className={input}>
                <option value="">Statut juridique</option>
                {LEGAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LEGAL_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <input name="ice" inputMode="numeric" maxLength={15} placeholder="ICE (15 chiffres)" className={input} />
              <input name="rc" placeholder="RC" className={input} />
            </div>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            <Button type="submit" variant="accent" disabled={loading} className="w-full">
              {loading ? "Création…" : "Créer le client"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
