import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type TicketBody = {
  subject?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
};

function ticketRef() {
  const stamp = Date.now().toString(36).toUpperCase();
  return `TKT-${stamp}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as TicketBody;
    const subject = body.subject?.trim();
    const description = body.description?.trim();
    const priority = body.priority ?? "medium";

    if (!subject || !description) {
      return NextResponse.json(
        { error: "subject and description are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        reference: ticketRef(),
        subject,
        description,
        priority,
        status: "open",
        locale: session.user.locale || "fr",
        requesterId: session.user.id,
        messages: [
          {
            from: "client",
            body: description,
            at: new Date().toISOString(),
          },
        ],
      },
    });

    return NextResponse.json({ ok: true, ticket }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create ticket" }, { status: 500 });
  }
}
