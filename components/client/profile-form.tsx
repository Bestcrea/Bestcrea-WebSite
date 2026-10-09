"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

type Initial = {
  name: string;
  email: string;
  phone: string;
  company: string;
  ice: string;
  rc: string;
  address: string;
  city: string;
  clientCode: string;
  createdAt: string;
};

const field = "mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#7A35FF] focus:ring-2 focus:ring-[#7A35FF]/20";

export function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof Initial) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/client/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data?.error || "Erreur" });
    setMsg({ ok: true, text: "Profil enregistré." });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-3xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Identité du compte</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Nom complet<input required value={v.name} onChange={set("name")} className={field} /></label>
            <label className="block text-sm font-medium">Email<input value={v.email} disabled className={field + " bg-neutral-50 text-neutral-500"} /></label>
            <label className="block text-sm font-medium">Téléphone<input value={v.phone} onChange={set("phone")} className={field} /></label>
          </div>
        </section>

        <section className="rounded-3xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Profil de facturation</h2>
          <p className="mt-1 text-sm text-neutral-500">Ces informations apparaissent sur vos devis et factures.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">Société (optionnel)<input value={v.company} onChange={set("company")} className={field} /></label>
            <label className="block text-sm font-medium">ICE {v.company ? "*" : ""}<input value={v.ice} onChange={set("ice")} required={!!v.company} inputMode="numeric" maxLength={15} className={field} /></label>
            <label className="block text-sm font-medium">RC (optionnel)<input value={v.rc} onChange={set("rc")} className={field} /></label>
            <label className="block text-sm font-medium">Ville<input value={v.city} onChange={set("city")} className={field} /></label>
            <label className="block text-sm font-medium sm:col-span-2">Adresse<input value={v.address} onChange={set("address")} className={field} /></label>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#7A35FF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6A2BE0] disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
          </button>
          {msg ? <p className={msg.ok ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{msg.text}</p> : null}
        </div>
      </div>

      <aside className="h-fit rounded-3xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Compte</h2>
        <dl className="mt-4 divide-y text-sm">
          <div className="flex justify-between py-3"><dt className="text-neutral-500">Rôle</dt><dd className="rounded-full bg-[#7A35FF]/10 px-3 py-0.5 font-medium text-[#6A2BE0]">Client</dd></div>
          {initial.clientCode ? <div className="flex justify-between py-3"><dt className="text-neutral-500">Code client</dt><dd className="font-medium">{initial.clientCode}</dd></div> : null}
          <div className="flex justify-between py-3"><dt className="text-neutral-500">Compte créé</dt><dd className="font-medium">{new Date(initial.createdAt).toLocaleDateString()}</dd></div>
        </dl>
      </aside>
    </form>
  );
}
