export type LocalizedString = Record<string, string> | string | null | undefined;

export function pickLocale(
  value: LocalizedString,
  locale: string,
  fallback = ""
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return (
    value[locale] ??
    value.fr ??
    value.en ??
    Object.values(value).find((item) => typeof item === "string") ??
    fallback
  );
}

export function pickLocaleList(
  value: unknown,
  locale: string
): string[] {
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const list = record[locale] ?? record.fr ?? record.en;
  return Array.isArray(list) ? list.map(String) : [];
}
