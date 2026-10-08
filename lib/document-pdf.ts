import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type PdfParty = {
  name: string;
  lines: string[];
};

export type PdfLine = {
  name: string;
  description?: string | null;
  quantity: number;
  unitPrice?: number;
  discountPercent?: number;
  taxRate?: number;
  total?: number;
};

export type PdfDocumentInput = {
  kind: "Devis" | "Bon de commande" | "Bon de livraison" | "Facture";
  number: string;
  date: Date;
  secondaryLabel?: string;
  secondaryDate?: Date | null;
  status?: string;
  currency: string;
  client: PdfParty;
  title?: string | null;
  lines: PdfLine[];
  /** Omit for delivery notes (no prices). */
  totals?: { subtotal: number; discount: number; totalHt: number; tax: number; total: number; paid?: number };
  notes?: string | null;
  terms?: string | null;
  paymentInfo?: string[];
};

export const COMPANY = {
  name: "Bestcrea",
  tagline: "Agence digitale premium",
  lines: [
    process.env.COMPANY_ADDRESS || "Khemisset, Maroc",
    process.env.COMPANY_PHONE || "+212 636 499 140",
    process.env.COMPANY_EMAIL || "contact@bestcrea.com",
    process.env.COMPANY_WEBSITE || "www.bestcrea.com",
  ],
  legal: [process.env.COMPANY_ICE && `ICE : ${process.env.COMPANY_ICE}`, process.env.COMPANY_RC && `RC : ${process.env.COMPANY_RC}`]
    .filter(Boolean) as string[],
};

const ACCENT = rgb(0.478, 0.208, 1);
const DARK = rgb(0.16, 0.176, 0.196);
const GRAY = rgb(0.42, 0.45, 0.5);
const LIGHT = rgb(0.95, 0.94, 0.98);
const W = 595;
const H = 842;
const M = 42;

// Standard PDF fonts only support WinAnsi: strip anything else so rendering never throws.
function safe(text: string) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[  ]/g, " ")
    .replace(/[^\x20-\x7E¡-ÿ€–—]/g, "?");
}

function fmt(n: number) {
  // Avoid narrow no-break spaces from toLocaleString which WinAnsi can't encode.
  const [i, d] = n.toFixed(2).split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${d}`;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of safe(text).split(/\r?\n/)) {
    let line = "";
    for (const word of para.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    out.push(line);
  }
  return out;
}

export async function buildDocumentPdf(doc: PdfDocumentInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const priced = !!doc.totals;

  let page: PDFPage;
  let y = 0;
  let pageNo = 0;

  const text = (t: string, x: number, yy: number, size = 9, f = font, color = DARK) =>
    page.drawText(safe(t), { x, y: yy, size, font: f, color });
  const right = (t: string, xr: number, yy: number, size = 9, f = font, color = DARK) =>
    page.drawText(safe(t), { x: xr - f.widthOfTextAtSize(safe(t), size), y: yy, size, font: f, color });

  const footer = () => {
    page.drawLine({ start: { x: M, y: 48 }, end: { x: W - M, y: 48 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.88) });
    const foot = [COMPANY.name, ...COMPANY.lines.slice(0, 3), ...COMPANY.legal].join("  |  ");
    text(foot, M, 34, 7.5, font, GRAY);
    right(`Page ${pageNo}`, W - M, 34, 7.5, font, GRAY);
  };

  const columns = priced
    ? { name: M + 6, qty: 318, pu: 372, disc: 424, tva: 462, total: W - M - 6 }
    : { name: M + 6, qty: W - M - 6, pu: 0, disc: 0, tva: 0, total: 0 };

  const tableHeader = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 20, color: ACCENT });
    const white = rgb(1, 1, 1);
    text("Désignation", columns.name, y, 8.5, bold, white);
    if (priced) {
      right("Qté", columns.qty, y, 8.5, bold, white);
      right("P.U. HT", columns.pu + 28, y, 8.5, bold, white);
      right("Rem.", columns.disc + 18, y, 8.5, bold, white);
      right("TVA", columns.tva + 14, y, 8.5, bold, white);
      right("Total HT", columns.total, y, 8.5, bold, white);
    } else {
      right("Quantité", columns.qty, y, 8.5, bold, white);
    }
    y -= 24;
  };

  const newPage = () => {
    if (pageNo > 0) footer();
    page = pdf.addPage([W, H]);
    pageNo += 1;
    y = H - M;
  };

  // ---------- Header ----------
  newPage();
  page!.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: ACCENT });
  text(COMPANY.name, M, y - 14, 22, bold, ACCENT);
  text(COMPANY.tagline, M, y - 28, 9, font, GRAY);
  let hy = y - 44;
  for (const l of [...COMPANY.lines, ...COMPANY.legal]) {
    text(l, M, hy, 8.5, font, GRAY);
    hy -= 11;
  }

  right(doc.kind.toUpperCase(), W - M, y - 14, 20, bold, DARK);
  right(`N° ${doc.number}`, W - M, y - 32, 11, bold, ACCENT);
  right(`Date : ${doc.date.toLocaleDateString("fr-FR")}`, W - M, y - 46, 9, font, GRAY);
  if (doc.secondaryLabel && doc.secondaryDate) {
    right(`${doc.secondaryLabel} : ${doc.secondaryDate.toLocaleDateString("fr-FR")}`, W - M, y - 58, 9, font, GRAY);
  }
  if (doc.status) right(`Statut : ${doc.status}`, W - M, y - 70, 9, font, GRAY);

  y = Math.min(hy, y - 80) - 14;

  // ---------- Client box ----------
  const boxH = 18 + doc.client.lines.length * 11 + 6;
  page!.drawRectangle({ x: M, y: y - boxH + 12, width: 250, height: boxH, color: LIGHT });
  text("CLIENT", M + 10, y - 2, 8, bold, ACCENT);
  text(doc.client.name, M + 10, y - 15, 10, bold);
  let cy = y - 27;
  for (const l of doc.client.lines) {
    text(l, M + 10, cy, 8.5, font, GRAY);
    cy -= 11;
  }
  y -= boxH + 14;

  if (doc.title) {
    for (const l of wrap(`Objet : ${doc.title}`, bold, 10, W - 2 * M)) {
      text(l, M, y, 10, bold);
      y -= 14;
    }
    y -= 4;
  }

  // ---------- Table ----------
  tableHeader();
  for (const line of doc.lines) {
    const nameWidth = priced ? columns.qty - columns.name - 60 : columns.qty - columns.name - 60;
    const nameLines = wrap(line.name, bold, 9, nameWidth);
    const descLines = line.description ? wrap(line.description, font, 8, nameWidth) : [];
    const rowH = nameLines.length * 11 + descLines.length * 10 + 8;

    if (y - rowH < 150) {
      newPage();
      y -= 10;
      tableHeader();
    }

    nameLines.forEach((l, i) => text(l, columns.name, y - i * 11, 9, bold));
    descLines.forEach((l, i) => text(l, columns.name, y - nameLines.length * 11 - i * 10, 8, font, GRAY));
    const qty = Number.isInteger(line.quantity) ? String(line.quantity) : line.quantity.toFixed(2);
    right(qty, columns.qty, y, 9);
    if (priced) {
      right(fmt(line.unitPrice ?? 0), columns.pu + 28, y, 9);
      right(line.discountPercent ? `${line.discountPercent}%` : "-", columns.disc + 18, y, 9);
      right(`${line.taxRate ?? 0}%`, columns.tva + 14, y, 9);
      right(fmt(line.total ?? 0), columns.total, y, 9, bold);
    }
    y -= rowH;
    page!.drawLine({ start: { x: M, y: y + 6 }, end: { x: W - M, y: y + 6 }, thickness: 0.4, color: rgb(0.88, 0.88, 0.9) });
    y -= 8;
  }

  // ---------- Totals ----------
  if (doc.totals) {
    const t = doc.totals;
    if (y < 220) {
      newPage();
      y -= 10;
    }
    y -= 8;
    const lx = 340;
    const row = (label: string, value: string, strong = false) => {
      text(label, lx, y, strong ? 10 : 9, strong ? bold : font, strong ? DARK : GRAY);
      right(value, W - M - 6, y, strong ? 10 : 9, strong ? bold : font);
      y -= 15;
    };
    row("Sous-total HT", `${fmt(t.subtotal)} ${doc.currency}`);
    if (t.discount > 0) row("Remise", `- ${fmt(t.discount)} ${doc.currency}`);
    row("Total HT", `${fmt(t.totalHt)} ${doc.currency}`);
    row("TVA", `${fmt(t.tax)} ${doc.currency}`);
    y -= 8;
    page!.drawRectangle({ x: lx - 8, y: y - 6, width: W - M - lx + 8, height: 22, color: ACCENT });
    text("TOTAL TTC", lx, y, 10.5, bold, rgb(1, 1, 1));
    right(`${fmt(t.total)} ${doc.currency}`, W - M - 6, y, 10.5, bold, rgb(1, 1, 1));
    y -= 28;
    if (t.paid !== undefined) {
      row("Déjà réglé", `${fmt(t.paid)} ${doc.currency}`);
      row("Reste à payer", `${fmt(Math.max(0, t.total - t.paid))} ${doc.currency}`, true);
    }
  }

  // ---------- Blocks ----------
  const block = (title: string, content: string[] | string) => {
    const lines = Array.isArray(content) ? content : wrap(content, font, 8.5, W - 2 * M);
    if (y - lines.length * 11 < 80) {
      newPage();
      y -= 10;
    }
    y -= 6;
    text(title, M, y, 9, bold, ACCENT);
    y -= 13;
    for (const l of lines) {
      for (const w of wrap(l, font, 8.5, W - 2 * M)) {
        text(w, M, y, 8.5, font, DARK);
        y -= 11;
      }
    }
  };

  if (doc.paymentInfo?.length) block("COORDONNÉES DE PAIEMENT", doc.paymentInfo);
  if (doc.notes) block("NOTES", doc.notes);
  if (doc.terms) block("CONDITIONS", doc.terms);
  if (doc.kind === "Bon de livraison") {
    y -= 24;
    text("Signature du client :", M, y, 9, bold);
    text("Signature Bestcrea :", 330, y, 9, bold);
    page!.drawRectangle({ x: M, y: y - 70, width: 200, height: 60, borderColor: rgb(0.8, 0.8, 0.85), borderWidth: 0.6 });
    page!.drawRectangle({ x: 330, y: y - 70, width: 200, height: 60, borderColor: rgb(0.8, 0.8, 0.85), borderWidth: 0.6 });
  }

  footer();
  return pdf.save();
}
