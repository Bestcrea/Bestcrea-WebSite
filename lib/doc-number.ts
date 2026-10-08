import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DocType = "DD" | "DEV" | "BC" | "BL" | "FAC" | "CMD" | "CL";

type Tx = Prisma.TransactionClient | typeof prisma;

/**
 * Atomic, gap-free sequential number per document type and year, e.g. DEV-2026-0001.
 * Uses an upsert + increment so concurrent requests can never receive the same number.
 * Pass a transaction client to roll the number back together with the document.
 */
export async function nextDocumentNumber(type: DocType, tx: Tx = prisma, date = new Date()) {
  const year = date.getFullYear();
  const key = type === "CL" ? "CL" : `${type}-${year}`;

  const row = await tx.documentSequence.upsert({
    where: { key },
    create: { key, lastValue: 1 },
    update: { lastValue: { increment: 1 } },
  });

  const pad = String(row.lastValue).padStart(type === "CL" ? 6 : 4, "0");
  return type === "CL" ? `CL-${pad}` : `${type}-${year}-${pad}`;
}
