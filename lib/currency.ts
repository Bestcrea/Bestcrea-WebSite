/**
 * Returns the currency label to display next to a Moroccan-dirham amount,
 * localized for Arabic ("درهم") and left as the given Latin fallback
 * ("DH"/"MAD") for every other locale.
 */
export function currencyLabel(locale: string, fallback: string = "DH"): string {
  return locale === "ar" ? "درهم" : fallback;
}
