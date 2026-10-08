import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const title = body.title ?? { fr: body.titleFr || "Nouveau service" };
    const slug = (body.slug as string)?.trim() || slugify(title.fr || title.en || "service");

    const service = await prisma.service.create({
      data: {
        slug,
        title,
        excerpt: body.excerpt ?? null,
        description: body.description ?? null,
        features: body.features ?? null,
        icon: body.icon || null,
        image: body.image || null,
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder ?? 0),
      },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create service";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
