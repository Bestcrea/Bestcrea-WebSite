import type { PaymentMethod } from "@prisma/client";

export type PaymentOption = {
  id: PaymentMethod;
  label: string;
  logo: string;
  kind: "bank" | "transfer" | "paypal";
  /** Lines shown to the customer once selected. Account details come from env vars (never hard-coded). */
  instructions: string[];
};

const env = (key: string, fallback = "À communiquer par notre équipe") => process.env[key]?.trim() || fallback;

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
      instructions: [`Bénéficiaire : ${beneficiary}`, `RIB CIH : ${env("PAYMENT_CIH_RIB")}`, "Indiquez la référence de commande dans le motif du virement."],
    },
    {
      id: "bank_albarid",
      label: "Virement Al Barid Bank",
      logo: "/images/payment-methods/al-barid-bank.png",
      kind: "bank",
      instructions: [`Bénéficiaire : ${beneficiary}`, `RIB Al Barid Bank : ${env("PAYMENT_ALBARID_RIB")}`, "Indiquez la référence de commande dans le motif du virement."],
    },
    {
      id: "bank_chaabi",
      label: "Virement Banque Populaire (Chaabi)",
      logo: "/images/payment-methods/banque-populaire.png",
      kind: "bank",
      instructions: [`Bénéficiaire : ${beneficiary}`, `RIB Banque Populaire : ${env("PAYMENT_CHAABI_RIB")}`, "Indiquez la référence de commande dans le motif du virement."],
    },
    {
      id: "cash_plus",
      label: "Cash Plus",
      logo: "/images/payment-methods/cash-plus.jpeg",
      kind: "transfer",
      instructions: [`Bénéficiaire : ${beneficiary}`, `Téléphone / pièce du bénéficiaire : ${env("PAYMENT_TRANSFER_CONTACT")}`, "Saisissez ensuite le numéro de transaction (référence)."],
    },
    {
      id: "western_union",
      label: "Western Union",
      logo: "/images/payment-methods/western-union.png",
      kind: "transfer",
      instructions: [`Bénéficiaire : ${beneficiary}`, `Pays / ville : ${env("PAYMENT_TRANSFER_COUNTRY", "Maroc — Khemisset")}`, "Saisissez ensuite le MTCN (référence)."],
    },
    {
      id: "ria",
      label: "RIA",
      logo: "/images/payment-methods/ria.png",
      kind: "transfer",
      instructions: [`Bénéficiaire : ${beneficiary}`, `Pays / ville : ${env("PAYMENT_TRANSFER_COUNTRY", "Maroc — Khemisset")}`, "Saisissez ensuite le numéro de transfert (référence)."],
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
  return options;
}

export const PROOF_MAX_BYTES = 5 * 1024 * 1024;
export const PROOF_TYPES: Record<string, { ext: string; magic: number[] }> = {
  "application/pdf": { ext: "pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  "image/png": { ext: "png", magic: [0x89, 0x50, 0x4e, 0x47] },
  "image/jpeg": { ext: "jpg", magic: [0xff, 0xd8, 0xff] },
};
