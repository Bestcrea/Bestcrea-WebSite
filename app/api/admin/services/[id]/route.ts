import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const service = await prisma.service.findUnique({ where: { id: params.id } });
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...(body.slug !== undefined ? { slug: String(body.slug).trim() } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.features !== undefined ? { features: body.features } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
        ...(body.image !== undefined ? { image: body.image } : {}),
        ...(body.isActive !== undefined ? { isActive: !!body.isActive } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      },
    });
    return NextResponse.json({ service });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    await prisma.service.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
