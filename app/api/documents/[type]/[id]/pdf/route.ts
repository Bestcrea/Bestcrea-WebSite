import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/rbac";
import { roleCan } from "@/lib/permissions";
import { buildDocumentPdf, type PdfParty } from "@/lib/document-pdf";
import { LEGAL_STATUS_LABELS } from "@/lib/validators";
import { rowsToLines } from "@/lib/documents";
import { computeTotals } from "@/lib/totals";

export const runtime = "nodejs";

type Params = { params: Promise<{ type: string; id: string }> };

const PERMISSION: Record<string, string> = {
  quote: "quotes.view",
  "purchase-order": "purchase_orders.view",
  "delivery-note": "delivery_notes.view",
  invoice: "invoices.view",
};

type ClientRow = {
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  company: string | null;
  ice: string | null;
  rc: string | null;
  legalStatus: keyof typeof LEGAL_STATUS_LABELS | null;
  clientCode: string | null;
};

const CLIENT_SELECT = {
  name: true, email: true, phone: true, address: true, city: true,
  company: true, ice: true, rc: true, legalStatus: true, clientCode: true,
} as const;

function party(u: ClientRow | null): PdfParty {
  if (!u) return { name: "—", lines: [] };
  const lines = [
    u.company && u.name ? u.name : null,
    u.legalStatus ? LEGAL_STATUS_LABELS[u.legalStatus] : null,
    u.address,
    u.city,
    u.email,
    u.phone,
    u.ice ? `ICE : ${u.ice}` : null,
    u.rc ? `RC : ${u.rc}` : null,
    u.clientCode ? `Code client : ${u.clientCode}` : null,
  ].filter(Boolean) as string[];
  return { name: u.company || u.name || u.email, lines };
}

const toPdfLines = (rows: Parameters<typeof rowsToLines>[0]) => {
  const t = computeTotals(rowsToLines(rows));
  return t.lines.map((l) => ({
    name: l.name,
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    discountPercent: l.discountPercent,
    taxRate: l.taxRate,
    total: l.lineTotal,
  }));
};

export async function GET(_request: NextRequest, props: Params) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const permission = PERMISSION[params.type];
  if (!permission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const staff = isStaffRole(session.user.role) && (await roleCan(session.user.role, permission));
  // Clients can only ever read their own documents; never anyone else's.
  const scope = staff ? {} : { userId: session.user.id };
  if (!staff && isStaffRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let bytes: Uint8Array;
  let filename: string;

  if (params.type === "quote") {
    const q = await prisma.quote.findFirst({
      where: { id: params.id, ...scope, ...(staff ? {} : { status: { not: "draft" } }) },
      include: { lines: { orderBy: { position: "asc" } }, user: { select: CLIENT_SELECT } },
    });
    if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
    filename = q.reference;
    bytes = await buildDocumentPdf({
      kind: "Devis",
      number: q.reference,
      date: q.issueDate,
      secondaryLabel: "Valable jusqu'au",
      secondaryDate: q.validUntil,
      currency: q.currency,
      client: party(q.user),
      title: q.title,
      lines: toPdfLines(q.lines),
      totals: {
        subtotal: Number(q.subtotal), discount: Number(q.discountTotal), totalHt: Number(q.totalHt),
        tax: Number(q.taxTotal), total: Number(q.total),
      },
      notes: q.notes,
      terms: q.terms,
    });
  } else if (params.type === "purchase-order") {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id: params.id, ...scope, ...(staff ? {} : { status: { not: "draft" } }) },
      include: { lines: { orderBy: { position: "asc" } }, user: { select: CLIENT_SELECT }, quote: { select: { reference: true } } },
    });
    if (!po) return NextResponse.json({ error: "Not found" }, { status: 404 });
    filename = po.number;
    bytes = await buildDocumentPdf({
      kind: "Bon de commande",
      number: po.number,
      date: po.issueDate,
      currency: po.currency,
      client: party(po.user),
      title: po.quote ? `Selon devis ${po.quote.reference}` : null,
      lines: toPdfLines(po.lines),
      totals: {
        subtotal: Number(po.subtotal), discount: Number(po.discountTotal), totalHt: Number(po.totalHt),
        tax: Number(po.taxTotal), total: Number(po.total),
      },
      notes: po.notes,
      terms: po.terms,
    });
  } else if (params.type === "delivery-note") {
    const bl = await prisma.deliveryNote.findFirst({
      where: { id: params.id, ...scope, ...(staff ? {} : { status: { not: "draft" } }) },
      include: { lines: { orderBy: { position: "asc" } }, user: { select: CLIENT_SELECT }, order: { select: { number: true } } },
    });
    if (!bl) return NextResponse.json({ error: "Not found" }, { status: 404 });
    filename = bl.number;
    bytes = await buildDocumentPdf({
      kind: "Bon de livraison",
      number: bl.number,
      date: bl.issueDate,
      secondaryLabel: "Livré le",
      secondaryDate: bl.deliveredAt,
      currency: "DH",
      client: party(bl.user),
      title: `Commande ${bl.order.number}`,
      lines: bl.lines.map((l) => ({ name: l.name, description: l.description, quantity: Number(l.quantity) })),
      notes: bl.notes,
    });
  } else {
    const inv = await prisma.invoice.findFirst({
      where: { id: params.id, ...scope, ...(staff ? {} : { status: { notIn: ["draft"] } }) },
      include: { lines: { orderBy: { position: "asc" } }, user: { select: CLIENT_SELECT } },
    });
    if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });
    filename = inv.reference;

    // Legacy invoices (created before line items existed) fall back to a single line.
    const lines = inv.lines.length
      ? toPdfLines(inv.lines)
      : [{ name: inv.title, description: inv.description, quantity: 1, unitPrice: Number(inv.amount), taxRate: 0, total: Number(inv.amount) }];

    bytes = await buildDocumentPdf({
      kind: "Facture",
      number: inv.reference,
      date: inv.issuedAt ?? inv.createdAt,
      secondaryLabel: "Échéance",
      secondaryDate: inv.dueAt,
      currency: inv.currency,
      client: party(inv.user),
      title: inv.title,
      lines,
      totals: {
        subtotal: Number(inv.amount) + Number(inv.discountTotal),
        discount: Number(inv.discountTotal),
        totalHt: Number(inv.amount),
        tax: Number(inv.taxAmount),
        total: Number(inv.totalAmount),
        paid: Number(inv.paidTotal),
      },
      notes: inv.notes,
      terms: inv.terms,
      paymentInfo: [
        "Virement bancaire / méthodes de paiement disponibles dans votre espace client.",
        `Merci de rappeler la référence ${inv.reference} dans votre règlement.`,
      ],
    });
  }

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
