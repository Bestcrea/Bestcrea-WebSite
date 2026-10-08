/**
 * Money maths for quotes, purchase orders and invoices.
 * All computation is done in integer cents to avoid floating point drift, and is the ONLY
 * place totals are calculated — server routes always recompute from raw lines and never trust
 * totals sent by the browser.
 */

export type LineInput = {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  /** 0–100 */
  discountPercent?: number;
  /** VAT rate, e.g. 20 */
  taxRate?: number;
};

export type ComputedLine = Required<Omit<LineInput, "description">> & {
  description: string | null;
  /** HT after line discount */
  lineTotal: number;
  /** Gross HT before discount */
  gross: number;
  discount: number;
  tax: number;
};

export type Totals = {
  lines: ComputedLine[];
  /** Σ gross (before discount) */
  subtotal: number;
  discountTotal: number;
  totalHt: number;
  taxTotal: number;
  /** TTC */
  total: number;
};

const toCents = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100);
const fromCents = (c: number) => c / 100;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const DEFAULT_VAT = 20;

export function computeTotals(input: LineInput[], defaultTaxRate = DEFAULT_VAT): Totals {
  let subtotalC = 0;
  let discountC = 0;
  let htC = 0;
  let taxC = 0;

  const lines = input.map((l) => {
    const quantity = Math.max(0, Number(l.quantity) || 0);
    const unitPrice = Math.max(0, Number(l.unitPrice) || 0);
    const discountPercent = clamp(Number(l.discountPercent ?? 0) || 0, 0, 100);
    const taxRate = clamp(Number(l.taxRate ?? defaultTaxRate) || 0, 0, 100);

    const grossC = Math.round(toCents(unitPrice) * quantity);
    const lineDiscountC = Math.round((grossC * discountPercent) / 100);
    const netC = grossC - lineDiscountC;
    const lineTaxC = Math.round((netC * taxRate) / 100);

    subtotalC += grossC;
    discountC += lineDiscountC;
    htC += netC;
    taxC += lineTaxC;

    return {
      name: l.name,
      description: l.description ?? null,
      quantity,
      unitPrice,
      discountPercent,
      taxRate,
      lineTotal: fromCents(netC),
      gross: fromCents(grossC),
      discount: fromCents(lineDiscountC),
      tax: fromCents(lineTaxC),
    };
  });

  return {
    lines,
    subtotal: fromCents(subtotalC),
    discountTotal: fromCents(discountC),
    totalHt: fromCents(htC),
    taxTotal: fromCents(taxC),
    total: fromCents(htC + taxC),
  };
}

/** Validate raw line payloads coming from the browser. Returns an error string or the clean lines. */
export function parseLines(raw: unknown): { error: string } | { lines: LineInput[] } {
  if (!Array.isArray(raw) || raw.length === 0) return { error: "At least one line is required" };
  if (raw.length > 100) return { error: "Too many lines (max 100)" };

  const lines: LineInput[] = [];
  for (const item of raw) {
    const l = item as Record<string, unknown>;
    const name = typeof l.name === "string" ? l.name.trim().slice(0, 255) : "";
    const quantity = Number(l.quantity);
    const unitPrice = Number(l.unitPrice);
    if (!name) return { error: "Each line needs a name" };
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000) return { error: `Invalid quantity for "${name}"` };
    if (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 1_000_000_000) return { error: `Invalid price for "${name}"` };
    const discountPercent = l.discountPercent === undefined || l.discountPercent === "" ? 0 : Number(l.discountPercent);
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) return { error: `Invalid discount for "${name}"` };
    const taxRate = l.taxRate === undefined || l.taxRate === "" ? DEFAULT_VAT : Number(l.taxRate);
    if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) return { error: `Invalid VAT rate for "${name}"` };

    lines.push({
      name,
      description: typeof l.description === "string" ? l.description.trim().slice(0, 2000) || null : null,
      quantity,
      unitPrice,
      discountPercent,
      taxRate,
    });
  }
  return { lines };
}
