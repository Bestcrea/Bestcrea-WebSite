import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";
import { notifyClient } from "@/lib/notify";
import { audit } from "@/lib/audit";
import { clean } from "@/lib/validators";

type Params = { params: { id: string } };

/** Send a message to a client: in-portal notification + email. */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi("messages.view");
  if (auth.error) return auth.error;

  const body = (await request.json().catch(() => ({}))) as { subject?: string; message?: string };
  const subject = clean(body.subject, 160);
  const message = clean(body.message, 5000);
  if (!subject || !message) {
    return NextResponse.json({ error: "subject and message are required" }, { status: 400 });
  }

  const client = await prisma.user.findFirst({ where: { id: params.id, role: "client" } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await notifyClient(client.id, { type: "message.new", title: subject, body: message });
  const mail = await sendMail({
    to: client.email,
    subject: `[Bestcrea] ${subject}`,
    text: `Bonjour ${client.firstName || client.name || ""},\n\n${message}\n\n— L'équipe Bestcrea`,
  }).catch(() => ({ ok: false, mode: "dev-log" as const }));

  await audit({
    userId: auth.session.user.id,
    action: "client.message_sent",
    entity: "User",
    entityId: client.id,
    changes: { subject },
    request,
  });

  return NextResponse.json({ ok: true, mailer: mail.mode });
}
