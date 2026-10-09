"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";

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


/** Elegant payment panel: method header + amount, step 1 (pay), step 2 (send proof — children). */
export function PaymentCard({
  logo,
  label,
  amount,
  lines,
  whatsapp,
  children,
}: {
  logo: string;
  label: string;
  amount?: string;
  lines: string[];
  whatsapp?: { url: string; label: string };
  children?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#7A35FF] to-[#9B5CFF] px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative h-11 w-16 shrink-0 rounded-xl bg-white p-1.5">
            <Image src={logo} alt="" fill sizes="64px" className="object-contain p-1" />
          </span>
          <div>
            <p className="text-xs text-white/75">Mode de paiement</p>
            <p className="font-semibold leading-tight">{label}</p>
          </div>
        </div>
        {amount ? (
          <div className="text-end">
            <p className="text-xs text-white/75">Montant à payer</p>
            <p className="text-xl font-bold leading-tight">{amount}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7A35FF] text-xs text-white">1</span>
            Effectuez le paiement
          </h3>
          <PaymentDetails lines={lines} />
          {whatsapp ? (
            <a
              href={whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" /> {whatsapp.label}
            </a>
          ) : null}
        </section>

        {children ? (
          <section className="border-t pt-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7A35FF] text-xs text-white">2</span>
              Envoyez votre justificatif
            </h3>
            {children}
          </section>
        ) : null}
      </div>
    </div>
  );
}
