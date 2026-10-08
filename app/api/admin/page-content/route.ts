import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const pages = await prisma.pageContent.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ pages });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (!body.key) {
      return NextResponse.json({ error: "key required" }, { status: 400 });
    }

    const page = await prisma.pageContent.upsert({
      where: { key: body.key },
      create: {
        key: body.key,
        title: body.title ?? { fr: body.key },
        seoDescription: body.seoDescription ?? null,
        content: body.content ?? {},
        isPublished: body.isPublished !== false,
      },
      update: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.seoDescription !== undefined
          ? { seoDescription: body.seoDescription }
          : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.isPublished !== undefined ? { isPublished: !!body.isPublished } : {}),
      },
    });

    return NextResponse.json({ page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
