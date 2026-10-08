import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

const SETTINGS_KEY = "site.settings";

const defaultSettings = {
  seo: {
    siteName: "Bestcrea",
    defaultTitle: "Bestcrea — Agence digitale premium",
    defaultDescription: "Design, développement, SaaS et automatisation.",
  },
  smtp: {
    host: "",
    port: 587,
    user: "",
    from: "contact@bestcrea.com",
  },
  apiKeys: {
    openai: "",
    maps: "",
    analytics: "",
  },
  colors: {
    primary: "#292D32",
    accent: "#7A35FF",
    background: "#F0F2F5",
  },
};

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const page = await prisma.pageContent.findUnique({ where: { key: SETTINGS_KEY } });
  const settings =
    page?.content && typeof page.content === "object"
      ? { ...defaultSettings, ...(page.content as object) }
      : defaultSettings;

  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const settings = { ...defaultSettings, ...(body.settings || body) };

    const page = await prisma.pageContent.upsert({
      where: { key: SETTINGS_KEY },
      create: {
        key: SETTINGS_KEY,
        title: { fr: "Paramètres site", en: "Site settings" },
        content: settings,
        isPublished: false,
      },
      update: {
        content: settings,
      },
    });

    return NextResponse.json({ settings: page.content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
