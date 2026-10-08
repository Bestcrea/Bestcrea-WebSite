/** Format a Decimal/number/string amount, e.g. "12 500,00". */
export function money(value: unknown, locale = "fr-MA") {
  const n = Number(value ?? 0);
  return n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function dateFmt(value: Date | string | null | undefined, locale = "fr-FR") {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export function dateTimeFmt(value: Date | string | null | undefined, locale = "fr-FR") {
  if (!value) return "—";
  return new Date(value).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
