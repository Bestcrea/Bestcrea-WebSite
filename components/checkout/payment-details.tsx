"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

type Row = { label: string; value: string };

/**
 * Payment instructions as a bank-style table (label / value) with "Copy" and "Share" buttons.
 * Lines like "Label : value" become table rows; other lines stay as notes under the table.
 */
export function PaymentDetails({ lines }: { lines: string[] }) {
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");
  const rows: Row[] = [];
  const notes: string[] = [];
  for (const line of lines) {
    const idx = line.indexOf(" : ");
    if (idx > 0 && idx < 28) rows.push({ label: line.slice(0, idx), value: line.slice(idx + 3) });
    else notes.push(line);
  }

  const text = rows.map((r) => `${r.label} : ${r.value}`).join("\n");

  function flash(next: "copied" | "shared") {
    setState(next);
    setTimeout(() => setState("idle"), 1800);
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(text);
      flash("copied");
    } catch {
      /* clipboard unavailable */
    }
  }

  async function copyOne(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "Coordonnées de paiement Bestcrea", text });
        flash("shared");
        return;
      } catch {
        return; // user cancelled
      }
    }
    await copyAll();
  }

  return (
    <div className="space-y-4">
      {rows.length ? (
        <div className="overflow-hidden rounded-2xl border bg-white">
          <dl className="divide-y">
            {rows.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => void copyOne(r.value)}
                title="Appuyer pour copier"
                className="flex w-full items-start justify-between gap-6 px-4 py-3.5 text-start hover:bg-neutral-50"
              >
                <dt className="shrink-0 text-sm font-medium text-neutral-900">{r.label}</dt>
                <dd className="break-all text-end text-sm font-medium text-neutral-900">{r.value}</dd>
              </button>
            ))}
          </dl>
        </div>
      ) : null}

      {rows.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => void copyAll()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A35FF] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6A2BE0]"
          >
            {state === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {state === "copied" ? "Copié" : "Copier les informations"}
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7A35FF] bg-white px-4 py-3 text-sm font-semibold text-[#7A35FF] transition hover:bg-[#7A35FF]/5"
          >
            {state === "shared" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            Partager
          </button>
        </div>
      ) : null}

      {notes.length ? (
        <ul className="space-y-1 text-sm text-neutral-600">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
