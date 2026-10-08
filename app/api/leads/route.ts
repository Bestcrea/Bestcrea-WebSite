import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/mailer";

type LeadMetadata = {
  city?: string;
  address?: string;
  isCompany?: boolean;
  ice?: string;
  rc?: string;
};

type LeadBody = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  source?: string;
  locale?: string;
  metadata?: LeadMetadata;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadBody;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "name, email and message are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    const metadata = body.metadata
      ? {
          city: body.metadata.city?.trim() || undefined,
          address: body.metadata.address?.trim() || undefined,
          isCompany: Boolean(body.metadata.isCompany),
          ice: body.metadata.ice?.trim() || undefined,
          rc: body.metadata.rc?.trim() || undefined,
        }
      : undefined;
    const hasMetadata = metadata && Object.values(metadata).some((value) => value);

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        message,
        source: body.source?.trim() || "contact",
        locale: body.locale?.trim() || "fr",
        status: "new",
        metadata: hasMetadata ? metadata : undefined,
      },
    });

    const mail = await notifyNewLead({
      name,
      email,
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      message,
      source: body.source?.trim() || "contact",
      locale: body.locale?.trim() || "fr",
      metadata,
    }).catch((error) => {
      console.error("[api/leads] mailer failed", error);
      return { ok: false, mode: "dev-log" as const };
    });

    return NextResponse.json(
      { id: lead.id, ok: true, mailer: mail.mode },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to create lead" }, { status: 500 });
  }
}
