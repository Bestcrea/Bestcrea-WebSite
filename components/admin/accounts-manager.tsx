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
import { StatusBadge } from "@/components/admin/status-badge";
import { ROLE_LABELS, STAFF_ROLES } from "@/lib/rbac";

type Account = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  accountStatus: "active" | "suspended";
  lastActivityAt: string | null;
};

const input = "w-full rounded-lg border px-3 py-2 text-sm";

export function AccountsManager({
  accounts,
  currentUserId,
  actorIsAdmin,
}: {
  accounts: Account[];
  currentUserId: string;
  actorIsAdmin: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; tempPassword: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const assignable = STAFF_ROLES.filter((r) => actorIsAdmin || r !== "admin");

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; tempPassword?: string; account?: { email: string } }
      | null;
    if (!response.ok || !payload?.tempPassword) {
      setError(payload?.error || "Création impossible.");
      return;
    }
    setCreated({ email: payload.account?.email ?? "", tempPassword: payload.tempPassword });
    router.refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setBusy(id);
    const response = await fetch(`/api/admin/accounts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(null);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      alert(payload?.error || "Action impossible.");
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce compte ?")) return;
    setBusy(id);
    const response = await fetch(`/api/admin/accounts/${id}`, { method: "DELETE" });
    setBusy(null);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      alert(payload?.error || "Suppression impossible.");
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setCreated(null);
              setError(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="h-4 w-4" /> Nouveau compte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau compte staff</DialogTitle>
              <DialogDescription>Un mot de passe temporaire est généré (affiché une seule fois).</DialogDescription>
            </DialogHeader>
            {created ? (
              <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
                <p className="font-medium text-emerald-900">Compte créé : {created.email}</p>
                <p>
                  Mot de passe temporaire :{" "}
                  <code className="rounded bg-white px-2 py-1 font-mono">{created.tempPassword}</code>
                </p>
              </div>
            ) : (
              <form onSubmit={createAccount} className="space-y-3">
                <input name="name" required placeholder="Nom complet *" className={input} />
                <input name="email" type="email" required placeholder="Email *" className={input} />
                <input name="phone" placeholder="Téléphone" className={input} />
                <select name="role" required defaultValue="collaborateur" className={input}>
                  {assignable.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button type="submit" variant="accent" className="w-full">
                  Créer le compte
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {accounts.map((a) => {
          const locked = (a.role === "admin" && !actorIsAdmin) || busy === a.id;
          return (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {a.name || a.email}
                  {a.id === currentUserId ? <span className="ms-2 text-xs text-muted-foreground">(vous)</span> : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.email} · dernière activité {a.lastActivityAt ? new Date(a.lastActivityAt).toLocaleDateString("fr-FR") : "—"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={a.accountStatus} />
                <select
                  value={a.role}
                  disabled={locked}
                  onChange={(e) => patch(a.id, { role: e.target.value })}
                  className="rounded-lg border px-2 py-1.5 text-sm disabled:opacity-50"
                  aria-label="Rôle"
                >
                  {STAFF_ROLES.filter((r) => actorIsAdmin || r !== "admin" || a.role === "admin").map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={locked || a.id === currentUserId}
                  onClick={() => patch(a.id, { accountStatus: a.accountStatus === "active" ? "suspended" : "active" })}
                >
                  {a.accountStatus === "active" ? "Suspendre" : "Activer"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={locked || a.id === currentUserId}
                  onClick={() => remove(a.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
