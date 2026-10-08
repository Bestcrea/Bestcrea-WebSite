import type { PaymentMethod } from "@prisma/client";

export type PaymentOption = {
  id: PaymentMethod;
  label: string;
  logo: string;
  kind: "bank" | "transfer" | "paypal";
  /** WhatsApp link to request payment details (Western Union / RIA). */
  whatsapp?: { url: string; label: string };
  /** Lines shown to the customer once selected. Account details come from env vars (never hard-coded). */
  instructions: string[];
};

const env = (key: string, fallback = "À communiquer par notre équipe") => process.env[key]?.trim() || fallback;

/** Env value with several lines separated by "|" (e.g. "Titulaire : X | RIB : Y | IBAN : Z"). */
const lines = (key: string, fallback = "À communiquer par notre équipe") =>
  env(key, fallback).split("|").map((l) => l.trim()).filter(Boolean);

const WHATSAPP_NUMBER = (process.env.PAYMENT_WHATSAPP || "212636499140").replace(/\D/g, "");
const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/** Whether PayPal is configured on the server (secrets stay server-side). */
export function paypalEnabled() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function getPaymentOptions(): PaymentOption[] {
  const beneficiary = env("PAYMENT_BENEFICIARY", "Bestcrea");
  const options: PaymentOption[] = [
    {
      id: "bank_cih",
      label: "Virement CIH Bank",
      logo: "/images/payment-methods/cih-bank.png",
      kind: "bank",
      instructions: [`Bénéficiaire : ${beneficiary}`, ...lines("PAYMENT_CIH_RIB"), "Indiquez la référence de commande dans le motif du virement."],
    },
    {
      id: "bank_albarid",
      label: "Virement Al Barid Bank",
      logo: "/images/payment-methods/al-barid-bank.png",
      kind: "bank",
      instructions: [`Bénéficiaire : ${beneficiary}`, ...lines("PAYMENT_ALBARID_RIB"), "Indiquez la référence de commande dans le motif du virement."],
    },
    {
      id: "bank_chaabi",
      label: "Virement Banque Populaire (Chaabi)",
      logo: "/images/payment-methods/banque-populaire.png",
      kind: "bank",
      instructions: [`Bénéficiaire : ${beneficiary}`, ...lines("PAYMENT_CHAABI_RIB"), "Indiquez la référence de commande dans le motif du virement."],
    },
    {
      id: "cash_plus",
      label: "Cash Plus",
      logo: "/images/payment-methods/cash-plus.jpeg",
      kind: "transfer",
      instructions: [...lines("PAYMENT_CASHPLUS"), "Saisissez ensuite le numéro de transaction (référence) ou joignez le reçu."],
    },
    {
      id: "western_union",
      label: "Western Union",
      logo: "/images/payment-methods/western-union.png",
      kind: "bank",
      whatsapp: {
        url: whatsappLink("Bonjour Bestcrea, je souhaite payer ma commande par Western Union. Pouvez-vous m'envoyer les informations de paiement ?"),
        label: "Demander les informations de paiement via WhatsApp",
      },
      instructions: [`Bénéficiaire : ${beneficiary}`, "Cliquez sur le bouton ci-dessous : nous vous envoyons les informations de paiement sur WhatsApp.", "Après l'envoi, indiquez la référence du transfert (optionnel) ou joignez le reçu."],
    },
    {
      id: "ria",
      label: "RIA",
      logo: "/images/payment-methods/ria.png",
      kind: "bank",
      whatsapp: {
        url: whatsappLink("Bonjour Bestcrea, je souhaite payer ma commande par RIA. Pouvez-vous m'envoyer les informations de paiement ?"),
        label: "Demander les informations de paiement via WhatsApp",
      },
      instructions: [`Bénéficiaire : ${beneficiary}`, "Cliquez sur le bouton ci-dessous : nous vous envoyons les informations de paiement sur WhatsApp.", "Après l'envoi, indiquez la référence du transfert (optionnel) ou joignez le reçu."],
    },
  ];
  if (paypalEnabled()) {
    options.push({
      id: "paypal",
      label: "PayPal",
      logo: "/images/payment-methods/paypal.jpeg",
      kind: "paypal",
      instructions: ["Paiement sécurisé par PayPal. Votre commande est confirmée dès validation du paiement."],
    });
  }
  else if (process.env.PAYMENT_PAYPAL_EMAIL?.trim()) {
    // No PayPal API keys: manual PayPal (customer sends money to our PayPal address, then gives the transaction ID).
    options.push({
      id: "paypal",
      label: "PayPal",
      logo: "/images/payment-methods/paypal.jpeg",
      kind: "bank",
      instructions: [
        `Envoyez le montant à notre compte PayPal : ${process.env.PAYMENT_PAYPAL_EMAIL.trim()}`,
        "Indiquez la référence de commande dans la note du paiement.",
        "Ajoutez ensuite l'identifiant de transaction (optionnel) ou joignez la capture.",
      ],
    });
  }
  return options;
}

export const PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const PROOF_TYPES: Record<string, { ext: string; magic: number[] }> = {
  "application/pdf": { ext: "pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
};
