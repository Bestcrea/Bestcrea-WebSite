import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientApi } from "@/lib/client-api";

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function PATCH(request: NextRequest) {
  const guard = await requireClientApi();
  if ("error" in guard) return guard.error;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  if (!name) return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: guard.session.user.id }, select: { ice: true, company: true } });
  const company = clean(body.company, 160);
  const ice = clean(body.ice, 30);
  // A company account must keep a valid ICE.
  if (company && !(ice || user?.ice)) {
    return NextResponse.json({ error: "L'ICE est obligatoire pour une société." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: guard.session.user.id },
    data: {
      name,
      phone: phone || null,
      company: company || null,
      address: clean(body.address) || null,
      city: clean(body.city, 100) || null,
      ice: ice || null,
      rc: clean(body.rc, 30) || null,
    },
  });
  return NextResponse.json({ ok: true });
}
