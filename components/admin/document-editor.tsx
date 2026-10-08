"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeTotals } from "@/lib/totals";

export type EditorLine = {
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  discountPercent: string;
  taxRate: string;
};

export type EditorClient = { id: string; label: string };

type Props = {
  kind: "quote" | "invoice";
  clients: EditorClient[];
  /** Present when editing. */
  id?: string;
  initial?: {
    userId?: string;
    title?: string;
    description?: string;
    notes?: string;
    terms?: string;
    internalNotes?: string;
    currency?: string;
    /** yyyy-mm-dd — validUntil for quotes, dueAt for invoices */
    date?: string;
    quoteRequestId?: string;
    lines?: EditorLine[];
  };
  readOnly?: boolean;
};

const input = "w-full rounded-lg border px-3 py-2 text-sm disabled:bg-slate-50";
const emptyLine = (): EditorLine => ({ name: "", description: "", quantity: "1", unitPrice: "0", discountPercent: "0", taxRate: "20" });

const DEFAULT_TERMS =
  "Paiement selon les modalités convenues. Les travaux démarrent après réception de l'acompte ou du paiement intégral.";

export function DocumentEditor({ kind, clients, id, initial, readOnly }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState(initial?.userId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [terms, setTerms] = useState(initial?.terms ?? (id ? "" : DEFAULT_TERMS));
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes ?? "");
  const [currency, setCurrency] = useState(initial?.currency ?? "DH");
  const [date, setDate] = useState(initial?.date ?? "");
  const [lines, setLines] = useState<EditorLine[]>(initial?.lines?.length ? initial.lines : [emptyLine()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(
    () =>
      computeTotals(
        lines.map((l) => ({
          name: l.name || "-",
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          discountPercent: Number(l.discountPercent),
          taxRate: Number(l.taxRate),
        }))
      ),
    [lines]
  );

  const setLine = (i: number, patch: Partial<EditorLine>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!id && !userId) return setError("Choisissez un client.");
    setBusy(true);

    const payload: Record<string, unknown> = {
      title,
      description,
      notes,
      terms,
      currency,
      lines: lines.map((l) => ({ ...l })),
      ...(kind === "quote" ? { internalNotes, validUntil: date || null } : { dueAt: date || null }),
      ...(!id ? { userId, quoteRequestId: initial?.quoteRequestId } : {}),
    };

    const base = kind === "quote" ? "/api/admin/quotes" : "/api/admin/invoices";
    const response = await fetch(id ? `${base}/${id}` : base, {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as
      | { error?: string; quote?: { id: string }; invoice?: { id: string } }
      | null;
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Erreur lors de l'enregistrement.");

    if (!id) {
      const newId = data?.quote?.id ?? data?.invoice?.id;
      router.push(`/admin/${kind === "quote" ? "devis" : "facturation"}/${newId}`);
    } else {
      router.refresh();
    }
  }

  const dis = readOnly || busy;
  const money = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2">
        {!id ? (
          <label className="block space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
            Client *
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={input} required>
              <option value="">— Sélectionner un client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
          Titre / objet *
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} required disabled={dis} maxLength={255} />
        </label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={input} disabled={dis} />
        </label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          {kind === "quote" ? "Valable jusqu'au" : "Date d'échéance"}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} disabled={dis} />
        </label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Devise
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={input} disabled={dis}>
            <option value="DH">DH (MAD)</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2">Désignation</th>
              <th className="w-20 p-2">Qté</th>
              <th className="w-28 p-2">P.U. HT</th>
              <th className="w-20 p-2">Rem. %</th>
              <th className="w-20 p-2">TVA %</th>
              <th className="w-28 p-2 text-right">Total HT</th>
              <th className="w-10 p-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-t align-top">
                <td className="p-2">
                  <input value={l.name} onChange={(e) => setLine(i, { name: e.target.value })} placeholder="Service / produit" className={input} required disabled={dis} />
                  <input value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Description (optionnel)" className={`${input} mt-1 text-xs`} disabled={dis} />
                </td>
                <td className="p-2"><input type="number" min="0" step="any" value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} className={input} disabled={dis} /></td>
                <td className="p-2"><input type="number" min="0" step="any" value={l.unitPrice} onChange={(e) => setLine(i, { unitPrice: e.target.value })} className={input} disabled={dis} /></td>
                <td className="p-2"><input type="number" min="0" max="100" step="any" value={l.discountPercent} onChange={(e) => setLine(i, { discountPercent: e.target.value })} className={input} disabled={dis} /></td>
                <td className="p-2"><input type="number" min="0" max="100" step="any" value={l.taxRate} onChange={(e) => setLine(i, { taxRate: e.target.value })} className={input} disabled={dis} /></td>
                <td className="p-2 pt-4 text-right font-medium">{money(totals.lines[i]?.lineTotal ?? 0)}</td>
                <td className="p-2 pt-3">
                  {!dis && lines.length > 1 ? (
                    <button type="button" onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700" aria-label="Supprimer la ligne">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!dis ? (
          <div className="border-t p-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setLines((p) => [...p, emptyLine()])}>
              <Plus className="h-4 w-4" /> Ajouter une ligne
            </Button>
          </div>
        ) : null}
      </div>

      <div className="ml-auto w-full max-w-sm space-y-1 rounded-xl border bg-white p-4 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Sous-total HT</span><span>{money(totals.subtotal)} {currency}</span></div>
        {totals.discountTotal > 0 ? <div className="flex justify-between"><span className="text-muted-foreground">Remise</span><span>- {money(totals.discountTotal)} {currency}</span></div> : null}
        <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span>{money(totals.totalHt)} {currency}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">TVA</span><span>{money(totals.taxTotal)} {currency}</span></div>
        <div className="flex justify-between border-t pt-2 text-base font-semibold text-primary"><span>Total TTC</span><span>{money(totals.total)} {currency}</span></div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Notes (visibles par le client)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={input} disabled={dis} />
        </label>
        <label className="block space-y-1 text-xs font-medium text-muted-foreground">
          Conditions
          <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className={input} disabled={dis} />
        </label>
        {kind === "quote" ? (
          <label className="block space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
            Notes internes (jamais visibles par le client)
            <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} className={input} disabled={dis} />
          </label>
        ) : null}
      </div>

      {!readOnly ? (
        <div className="flex items-center gap-3">
          <Button type="submit" variant="accent" disabled={busy}>
            <Save className="h-4 w-4" /> {busy ? "Enregistrement…" : id ? "Enregistrer les modifications" : "Créer en brouillon"}
          </Button>
          {error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      ) : null}
    </form>
  );
}
