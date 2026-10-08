import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { isStaffRole } from "@/lib/rbac";
import { EMAIL_RE, clean } from "@/lib/validators";

/** Create a staff account with a one-time temporary password. */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi("users.manage");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
  };
  const name = clean(body.name, 160);
  const email = clean(body.email, 190)?.toLowerCase();

  if (!name || !email || !EMAIL_RE.test(email) || !isStaffRole(body.role)) {
    return NextResponse.json({ error: "name, valid email and a staff role are required" }, { status: 400 });
  }
  // Only an administrator can mint another administrator.
  if (body.role === "admin" && auth.session.user.role !== "admin") {
    return NextResponse.json({ error: "Only an administrator can create administrators" }, { status: 403 });
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "email already registered" }, { status: 409 });
  }

  const tempPassword = randomBytes(9).toString("base64url");
  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: body.role,
      phone: clean(body.phone, 40),
      passwordHash: await bcrypt.hash(tempPassword, 12),
    },
    select: { id: true, email: true, role: true },
  });

  await audit({
    userId: auth.session.user.id,
    action: "account.created",
    entity: "User",
    entityId: user.id,
    changes: { role: user.role },
    request,
  });

  return NextResponse.json({ ok: true, account: user, tempPassword }, { status: 201 });
}
