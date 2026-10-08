import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type AuditInput = {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  changes?: Prisma.InputJsonValue;
  request?: NextRequest | Request;
};

function clientIp(request?: NextRequest | Request) {
  const h = request?.headers;
  if (!h) return null;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

/**
 * Record an important action (quote created, payment confirmed, role changed, …).
 * Never throws: auditing must not break the business operation it describes.
 */
export async function audit(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        changes: input.changes,
        ip: clientIp(input.request),
        userAgent: input.request?.headers.get("user-agent")?.slice(0, 250) ?? null,
      },
    });
  } catch (error) {
    console.error("[audit] failed", error);
  }
}
