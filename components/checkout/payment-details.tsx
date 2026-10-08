"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Renders payment instructions: "Label : value" lines become copyable rows, other lines stay as notes. */
export function PaymentDetails({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const rows = lines.map((line) => {
    const idx = line.indexOf(" : ");
    return idx > 0 && idx < 28 ? { label: line.slice(0, idx), value: line.slice(idx + 3) } : { note: line };
  });

  return (
    <div className="space-y-2 text-sm">
      {rows.map((r, i) =>
        "note" in r ? (
          <p key={i} className="text-neutral-600">{r.note}</p>
        ) : (
          <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500">{r.label}</p>
              <p className="break-all font-medium text-neutral-900">{r.value}</p>
            </div>
            <button
              type="button"
              onClick={() => void copy(r.value)}
              aria-label={`Copier ${r.label}`}
              className="shrink-0 rounded-lg border bg-white p-2 text-neutral-600 hover:border-[#7A35FF] hover:text-[#7A35FF]"
            >
              {copied === r.value ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )
      )}
    </div>
  );
}
