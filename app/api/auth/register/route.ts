import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { nextDocumentNumber } from "@/lib/doc-number";
import { notifyStaff } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import {
  EMAIL_RE,
  clean,
  isLegalStatus,
  normalizeIce,
  validPassword,
} from "@/lib/validators";

type RegisterBody = {
  firstName?: string;
  lastName?: string;
  /** Legacy single-field name (still accepted) */
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  company?: string;
  ice?: string;
  rc?: string;
  legalStatus?: string;
  locale?: string;
};

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientKey(request, "register"), 10, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts, please retry later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = (await request.json()) as RegisterBody;

    let firstName = clean(body.firstName, 80);
    let lastName = clean(body.lastName, 80);
    const legacyName = clean(body.name, 160);
    if (!firstName && !lastName && legacyName) {
      const [first, ...rest] = legacyName.split(/\s+/);
      firstName = first ?? null;
      lastName = rest.join(" ") || null;
    }

    const email = clean(body.email, 190)?.toLowerCase();
    const password = body.password;
    const locale = clean(body.locale, 5) || "fr";

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: "firstName, email and password are required" },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
    if (!validPassword(password)) {
      return NextResponse.json(
        { error: "password must be at least 8 characters with a letter and a digit" },
        { status: 400 }
      );
    }
    if (body.legalStatus && !isLegalStatus(body.legalStatus)) {
      return NextResponse.json({ error: "invalid legalStatus" }, { status: 400 });
    }
    const ice = normalizeIce(body.ice);
    if (!ice.valid) {
      return NextResponse.json({ error: "ICE must contain 15 digits" }, { status: 400 });
    }

    if (clean(body.company, 190) && !ice.value) {
      return NextResponse.json({ error: "ICE is required for companies" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    const user = await prisma.$transaction(async (tx) => {
      const clientCode = await nextDocumentNumber("CL", tx);
      return tx.user.create({
        data: {
          name: fullName,
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
          locale,
          role: "client",
          clientCode,
        },
        select: { id: true, email: true, name: true, role: true, clientCode: true },
      });
    });

    await notifyStaff({
      type: "client.created",
      title: "Nouveau client",
      body: `${fullName} (${email}) vient de créer un compte.`,
      href: `/admin/clients/${user.id}`,
    });
    await audit({ userId: user.id, action: "client.registered", entity: "User", entityId: user.id, request });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    console.error("[register]", error);
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
