export type PaymentMethod = {
  logo: string;
  label: string;
};

/** Payment methods accepted for clients in Morocco. */
export const localPaymentMethods: PaymentMethod[] = [
  { logo: "/images/payment-methods/cih-bank.png", label: "CIH Bank" },
  { logo: "/images/payment-methods/al-barid-bank.png", label: "Al Barid Bank" },
  { logo: "/images/payment-methods/cash-plus.jpeg", label: "Cash Plus" },
  { logo: "/images/payment-methods/banque-populaire.png", label: "Banque Populaire" },
  { logo: "/images/payment-methods/paypal.jpeg", label: "PayPal" },
  { logo: "/images/payment-methods/western-union.png", label: "Western Union" },
];

/** International wire-transfer services for clients abroad. */
export const internationalPaymentMethods: PaymentMethod[] = [
  { logo: "/images/payment-methods/western-union.png", label: "Western Union" },
  { logo: "/images/payment-methods/ria.png", label: "Ria" },
  { logo: "/images/payment-methods/sendwave.jpeg", label: "Sendwave" },
];
