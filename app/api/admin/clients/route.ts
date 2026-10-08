import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/doc-number";
import { audit } from "@/lib/audit";
import { EMAIL_RE, clean, isLegalStatus, normalizeIce } from "@/lib/validators";

type Body = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  company?: string;
  ice?: string;
  rc?: string;
  legalStatus?: string;
};

/** Create a client account from the admin panel. Returns a one-time temporary password. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi("clients.create");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as Body;
  const firstName = clean(body.firstName, 80);
  const lastName = clean(body.lastName, 80);
  const email = clean(body.email, 190)?.toLowerCase();

  if (!firstName || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "firstName and a valid email are required" }, { status: 400 });
  }
  if (body.legalStatus && !isLegalStatus(body.legalStatus)) {
    return NextResponse.json({ error: "invalid legalStatus" }, { status: 400 });
  }
  const ice = normalizeIce(body.ice);
  if (!ice.valid) {
    return NextResponse.json({ error: "ICE must contain 15 digits" }, { status: 400 });
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "email already registered" }, { status: 409 });
  }

  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.$transaction(async (tx) => {
    const clientCode = await nextDocumentNumber("CL", tx);
    return tx.user.create({
      data: {
        name: [firstName, lastName].filter(Boolean).join(" "),
        firstName,
        lastName,
        email,
        passwordHash,
        phone: clean(body.phone, 40),
        address: clean(body.address, 255),
        city: clean(body.city, 120),
        company: clean(body.company, 190),
        ice: ice.value,
        rc: clean(body.rc, 60),
        legalStatus: isLegalStatus(body.legalStatus) ? body.legalStatus : null,
        role: "client",
        clientCode,
      },
      select: { id: true, clientCode: true, email: true },
    });
  });

  await audit({
    userId: auth.session.user.id,
    action: "client.created",
    entity: "User",
    entityId: user.id,
    request,
  });

  return NextResponse.json({ ok: true, client: user, tempPassword }, { status: 201 });
}
