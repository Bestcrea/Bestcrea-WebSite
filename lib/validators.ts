export const LEGAL_STATUSES = [
  "auto_entrepreneur",
  "sarl",
  "sarl_au",
  "sa",
  "association",
  "cooperative",
  "personne_physique",
] as const;

export type LegalStatusValue = (typeof LEGAL_STATUSES)[number];

export const LEGAL_STATUS_LABELS: Record<LegalStatusValue, string> = {
  auto_entrepreneur: "Auto-entrepreneur",
  sarl: "SARL",
  sarl_au: "SARL AU",
  sa: "SA",
  association: "ASSOCIATION",
  cooperative: "COOPÉRATIVE",
  personne_physique: "PERSONNE PHYSIQUE",
};

export function isLegalStatus(value: unknown): value is LegalStatusValue {
  return typeof value === "string" && (LEGAL_STATUSES as readonly string[]).includes(value);
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trim a string input; returns null for empty/non-string. Caps length to avoid abuse. */
export function clean(value: unknown, max = 255): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, max);
  return v || null;
}

/** Moroccan ICE is 15 digits. Returns normalized digits or null if invalid/empty. */
export function normalizeIce(value: unknown): { value: string | null; valid: boolean } {
  const v = clean(value, 32);
  if (!v) return { value: null, valid: true };
  const digits = v.replace(/\s/g, "");
  return { value: digits, valid: /^\d{15}$/.test(digits) };
}

/** Password policy: min 8 chars, at least one letter and one digit. */
export function validPassword(password: unknown): password is string {
  return typeof password === "string" && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}
