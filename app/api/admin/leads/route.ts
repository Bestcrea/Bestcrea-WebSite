import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { quotes: { select: { id: true, reference: true, status: true, amount: true } } },
  });
  return NextResponse.json({ leads });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 });
    }
    const lead = await prisma.lead.update({
      where: { id: body.id },
      data: { status: body.status },
    });
    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
