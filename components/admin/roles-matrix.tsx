"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERMISSION_GROUPS, ROLE_LABELS, STAFF_ROLES } from "@/lib/rbac";

const GROUP_LABELS: Record<string, string> = {
  clients: "Clients",
  quotes: "Devis",
  purchaseOrders: "Bons de commande",
  deliveryNotes: "Bons de livraison",
  invoices: "Facturation",
  orders: "Commandes & paiements",
  catalogue: "Catalogue",
  website: "Website",
  communication: "Communication",
  administration: "Administration",
};

const EDITABLE_ROLES = STAFF_ROLES.filter((r) => r !== "admin");

export function RolesMatrix({ initial }: { initial: Record<string, string[]> }) {
  const router = useRouter();
  const [role, setRole] = useState<string>(EDITABLE_ROLES[0]);
  const [state, setState] = useState<Record<string, string[]>>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const current = new Set(state[role] ?? []);

  function toggle(permission: string) {
    const next = new Set(current);
    if (next.has(permission)) next.delete(permission);
    else next.add(permission);
    setState({ ...state, [role]: Array.from(next) });
    setMessage(null);
  }

  function toggleGroup(permissions: readonly string[]) {
    const allOn = permissions.every((p) => current.has(p));
    const next = new Set(current);
    permissions.forEach((p) => (allOn ? next.delete(p) : next.add(p)));
    setState({ ...state, [role]: Array.from(next) });
    setMessage(null);
  }

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, permissions: state[role] ?? [] }),
    });
    setSaving(false);
    setMessage(response.ok ? "Permissions enregistrées." : "Erreur lors de l'enregistrement.");
    if (response.ok) router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {EDITABLE_ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRole(r);
              setMessage(null);
            }}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              role === r ? "border-[#7A35FF] bg-[#7A35FF] text-white" : "bg-white hover:bg-slate-50"
            }`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        L&apos;<strong>Administrateur</strong> possède toujours tous les droits et ne peut pas être restreint.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => {
          const allOn = permissions.every((p) => current.has(p));
          return (
            <div key={group} className="rounded-xl border bg-white p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-medium">{GROUP_LABELS[group] ?? group}</p>
                <button type="button" onClick={() => toggleGroup(permissions)} className="text-xs text-[#7A35FF] hover:underline">
                  {allOn ? "Tout retirer" : "Tout cocher"}
                </button>
              </div>
              <div className="space-y-1.5">
                {permissions.map((p) => (
                  <label key={p} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={current.has(p)}
                      onChange={() => toggle(p)}
                      className="h-4 w-4 rounded border-slate-300 accent-[#7A35FF]"
                    />
                    <span className="font-mono text-xs">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="accent" onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Enregistrement…" : `Enregistrer « ${ROLE_LABELS[role]} »`}
        </Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </div>
  );
}
