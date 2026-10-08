import { clean } from "@/lib/validators";
import { parseLines, type LineInput } from "@/lib/totals";

export function parseDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export type CommonDocBody = {
  title?: string | null;
  description?: string | null;
  notes?: string | null;
  terms?: string | null;
  internalNotes?: string | null;
  currency?: string;
  lines?: LineInput[];
};

/** Parse the fields shared by quote / invoice editors. Returns an error string on invalid input. */
export function parseCommon(body: Record<string, unknown>, requireLines: boolean) {
  const out: CommonDocBody = {};
  if ("title" in body) out.title = clean(body.title, 255);
  if ("description" in body) out.description = clean(body.description, 4000);
  if ("notes" in body) out.notes = clean(body.notes, 4000);
  if ("terms" in body) out.terms = clean(body.terms, 6000);
  if ("internalNotes" in body) out.internalNotes = clean(body.internalNotes, 4000);
  if ("currency" in body) {
    const c = clean(body.currency, 6)?.toUpperCase();
    if (c && !["DH", "MAD", "EUR", "USD"].includes(c)) return { error: "Invalid currency" } as const;
    out.currency = c === "MAD" ? "DH" : c ?? "DH";
  }
  if (requireLines || "lines" in body) {
    const parsed = parseLines(body.lines);
    if ("error" in parsed) return { error: parsed.error } as const;
    out.lines = parsed.lines;
  }
  return { value: out } as const;
}
