import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/rbac";
import { roleCan } from "@/lib/permissions";
import { PROOF_MIME, readProof } from "@/lib/proof-storage";

export const runtime = "nodejs";

/** Serve a proof of payment only to its owner or to staff who may verify payments. */
export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = isStaffRole(session.user.role) && (await roleCan(session.user.role, "payments.verify"));
  const payment = await prisma.payment.findFirst({
    where: { id: params.id, ...(staff ? {} : { order: { userId: session.user.id } }) },
    select: { proofPath: true, proofName: true },
  });
  if (!payment?.proofPath) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await readProof(payment.proofPath);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ext = payment.proofPath.split(".").pop() as string;
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": PROOF_MIME[ext] ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${payment.proofName ?? payment.proofPath}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
