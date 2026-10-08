"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Mail, Save, Trash2 } from "lucide-react";
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

type ClientData = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  company: string | null;
  ice: string | null;
  rc: string | null;
  legalStatus: string | null;
  accountStatus: "active" | "suspended";
};

type Can = { edit: boolean; suspend: boolean; delete: boolean; message: boolean };

const input = "w-full rounded-lg border px-3 py-2 text-sm";

export function ClientEditForm({ client, canEdit }: { client: ClientData; canEdit: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || "Erreur");
      setState("error");
      return;
    }
    setState("saved");
    router.refresh();
  }

  const field = (label: string, name: keyof ClientData, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block space-y-1 text-xs font-medium text-muted-foreground">
      {label}
      <input
        name={name}
        defaultValue={(client[name] as string | null) ?? ""}
        disabled={!canEdit}
        className={`${input} text-primary disabled:bg-slate-50`}
        {...props}
      />
    </label>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {field("Prénom", "firstName")}
        {field("Nom", "lastName")}
        {field("Email", "email", { type: "email", required: true })}
        {field("Téléphone", "phone")}
        {field("Adresse", "address")}
        {field("Ville", "city")}
        {field("Société", "company")}
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Statut juridique
          <select
            name="legalStatus"
            defaultValue={client.legalStatus ?? ""}
            disabled={!canEdit}
            className={`${input} text-primary disabled:bg-slate-50`}
          >
            <option value="">—</option>
            {LEGAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEGAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        {field("ICE", "ice", { inputMode: "numeric", maxLength: 15 })}
        {field("RC", "rc")}
      </div>
      {canEdit ? (
        <div className="flex items-center gap-3">
          <Button type="submit" variant="accent" disabled={state === "saving"}>
            <Save className="h-4 w-4" /> {state === "saving" ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {state === "saved" ? <span className="text-sm text-emerald-600">Enregistré.</span> : null}
          {state === "error" ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      ) : null}
    </form>
  );
}

export function ClientActions({ client, can }: { client: ClientData; can: Can }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgState, setMsgState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function setStatus(action: "activate" | "suspend") {
    if (action === "suspend" && !confirm("Suspendre ce compte ? Le client ne pourra plus se connecter.")) return;
    setBusy(true);
    await fetch(`/api/admin/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm("Supprimer définitivement ce client ? Cette action est irréversible.")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      alert(payload?.error || "Suppression impossible.");
      return;
    }
    router.push("/admin/clients");
    router.refresh();
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMsgState("sending");
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/admin/clients/${client.id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setMsgState(response.ok ? "sent" : "error");
    if (response.ok) setTimeout(() => setMsgOpen(false), 900);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {can.message ? (
        <Dialog open={msgOpen} onOpenChange={(v) => { setMsgOpen(v); if (!v) setMsgState("idle"); }}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Mail className="h-4 w-4" /> Envoyer un message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message à {client.firstName || client.email}</DialogTitle>
              <DialogDescription>Notification dans l&apos;espace client + email.</DialogDescription>
            </DialogHeader>
            <form onSubmit={sendMessage} className="space-y-3">
              <input name="subject" required placeholder="Objet" className={input} />
              <textarea name="message" required rows={5} placeholder="Votre message" className={input} />
              <Button type="submit" variant="accent" disabled={msgState === "sending"} className="w-full">
                {msgState === "sending" ? "Envoi…" : msgState === "sent" ? "Envoyé ✓" : "Envoyer"}
              </Button>
              {msgState === "error" ? <p className="text-sm text-red-600">Envoi impossible.</p> : null}
            </form>
          </DialogContent>
        </Dialog>
      ) : null}

      {can.suspend ? (
        client.accountStatus === "active" ? (
          <Button variant="outline" disabled={busy} onClick={() => setStatus("suspend")}>
            <Ban className="h-4 w-4" /> Suspendre
          </Button>
        ) : (
          <Button variant="outline" disabled={busy} onClick={() => setStatus("activate")}>
            <CheckCircle2 className="h-4 w-4" /> Activer
          </Button>
        )
      ) : null}

      {can.delete ? (
        <Button variant="destructive" disabled={busy} onClick={remove}>
          <Trash2 className="h-4 w-4" /> Supprimer
        </Button>
      ) : null}
    </div>
  );
}
