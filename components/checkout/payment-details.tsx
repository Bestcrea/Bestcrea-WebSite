"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Share2 } from "lucide-react";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { cn } from "@/lib/utils";

type Row = { label: string; value: string };

/** Known French config strings -> translation keys (labels come from config, not from the DB). */
const LABELS: Record<string, string> = {
  "Bénéficiaire": "l_beneficiary",
  Titulaire: "l_holder",
  "Téléphone": "l_phone",
  Pays: "l_country",
  "Compte PayPal": "l_paypal",
};
const NOTES: Record<string, string> = {
  "Indiquez la référence de commande dans le motif du virement.": "n_ref",
  "Saisissez ensuite le numéro de transaction (référence) ou joignez le reçu.": "n_cashplus",
  "Besoin d'autres informations ? Demandez-les via WhatsApp.": "n_ria",
  "Après l'envoi, indiquez la référence du transfert (MTCN / numéro) ou joignez le reçu.": "n_after",
  "Envoyez le montant de la commande à ce compte PayPal.": "n_paypal1",
  "Indiquez la référence de commande dans la note du paiement.": "n_paypal2",
  "Ajoutez ensuite l'identifiant de transaction (optionnel) ou joignez la capture.": "n_paypal3",
  "Paiement sécurisé par PayPal. Votre commande est confirmée dès validation du paiement.": "n_paypalSecure",
  "À communiquer par notre équipe": "n_notFilled",
};
const VALUES: Record<string, string> = { Maroc: "c_Maroc" };
/** Values that are account numbers: shown monospaced and never wrapped mid-group awkwardly. */
const NUMERIC_LABELS = new Set(["RIB", "IBAN", "Code SWIFT", "Téléphone"]);

function useCopy() {
  const [done, setDone] = useState<string | null>(null);
  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts / older browsers.
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand("copy");
      } catch {
        return;
      }
      document.body.removeChild(el);
    }
    setDone(key);
    setTimeout(() => setDone((d) => (d === key ? null : d)), 1600);
  }
  return { done, copy };
}

/** Compact bank-style details: label / value rows with a copy button per row, copy-all and share. */
export function PaymentDetails({ lines }: { lines: string[] }) {
  const t = useTranslations("Payment");
  const { done, copy } = useCopy();
  const rows: Row[] = [];
  const notes: string[] = [];
  for (const line of lines) {
    const idx = line.indexOf(" : ");
    if (idx > 0 && idx < 28) rows.push({ label: line.slice(0, idx), value: line.slice(idx + 3) });
    else notes.push(line);
  }
  const tr = (map: Record<string, string>, s: string) => (map[s] ? t(map[s]) : s);
  const text = rows.map((r) => `${r.label} : ${r.value}`).join("\n");

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: t("shareTitle"), text });
      } catch {
        /* cancelled */
      }
      return;
    }
    await copy("all", text);
  }

  return (
    <div className="space-y-3">
      {rows.length ? (
        <dl className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          {rows.map((r) => {
            const label = tr(LABELS, r.label);
            const value = tr(VALUES, r.value);
            const numeric = NUMERIC_LABELS.has(r.label);
            const isDone = done === r.label;
            return (
              <div key={r.label} className="flex items-center gap-3 px-3.5 py-2">
                <dt className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-500 sm:w-28">{label}</dt>
                <dd
                  dir={numeric ? "ltr" : undefined}
                  className={cn(
                    "min-w-0 flex-1 break-words text-sm font-medium text-neutral-900",
                    numeric && "font-mono text-[13px] tracking-tight [overflow-wrap:anywhere]"
                  )}
                >
                  {value}
                </dd>
                <button
                  type="button"
                  onClick={() => void copy(r.label, r.value)}
                  aria-label={`${t("copyValue")} ${label}`}
                  title={t("copyValue")}
                  className={cn(
                    "flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium transition",
                    isDone ? "bg-emerald-50 text-emerald-700" : "text-neutral-500 hover:bg-[#7A35FF]/10 hover:text-[#7A35FF]"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {isDone ? <span className="hidden sm:inline">{t("copied")}</span> : null}
                </button>
              </div>
            );
          })}
        </dl>
      ) : null}

      {rows.length ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copy("all", text)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#7A35FF] px-3.5 text-sm font-medium text-white transition hover:bg-[#6A2BE0] active:scale-[0.98]"
          >
            {done === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {done === "all" ? t("copied") : t("copyAll")}
          </button>
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 text-sm font-medium text-neutral-700 transition hover:border-[#7A35FF] hover:text-[#7A35FF] active:scale-[0.98]"
          >
            <Share2 className="h-4 w-4" /> {t("share")}
          </button>
        </div>
      ) : null}

      {notes.length ? (
        <ul className="space-y-0.5 text-xs leading-relaxed text-neutral-500">
          {notes.map((n) => (
            <li key={n}>{tr(NOTES, n)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Compact payment panel: method header + amount, step 1 (pay), step 2 (send proof — children). */
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
  const t = useTranslations("Payment");
  const display = label.startsWith("Virement ") ? `${t("bankTransfer")} ${label.slice(9)}` : label;
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <Image src={logo} alt="" fill sizes="48px" className="object-contain p-1" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">{t("paymentMethod")}</p>
            <p className="truncate text-sm font-semibold text-neutral-900">{display}</p>
          </div>
        </div>
        {amount ? (
          <div className="text-end">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">{t("amountToPay")}</p>
            <p className="text-lg font-bold leading-tight text-[#6A2BE0]">{amount}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-5 p-4">
        <section>
          <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7A35FF] text-[11px] text-white">1</span>
            {t("step1")}
          </h3>
          <PaymentDetails lines={lines} />
          {whatsapp ? <WhatsAppButton href={whatsapp.url} label={t("whatsapp")} className="mt-3 w-full sm:w-auto" /> : null}
        </section>

        {children ? (
          <section className="border-t border-neutral-100 pt-4">
            <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7A35FF] text-[11px] text-white">2</span>
              {t("step2")}
            </h3>
            {children}
          </section>
        ) : null}
      </div>
    </div>
  );
}
