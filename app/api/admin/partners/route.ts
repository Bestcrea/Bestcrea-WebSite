import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const [partners, testimonials] = await Promise.all([
    prisma.partner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return NextResponse.json({ partners, testimonials });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = await request.json();

  if (body.type === "partner") {
    const partner = await prisma.partner.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        logo: body.logo || null,
        website: body.website || null,
        isActive: body.isActive !== false,
        sortOrder: Number(body.sortOrder ?? 0),
      },
    });
    return NextResponse.json({ partner }, { status: 201 });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      authorName: body.authorName,
      company: body.company || null,
      content: body.content ?? { fr: body.contentFr || "" },
      role: body.role ?? null,
      rating: body.rating ? Number(body.rating) : 5,
      isFeatured: !!body.isFeatured,
      isActive: body.isActive !== false,
      sortOrder: Number(body.sortOrder ?? 0),
    },
  });
  return NextResponse.json({ testimonial }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const body = await request.json();
  if (!body.id || !body.type) {
    return NextResponse.json({ error: "id and type required" }, { status: 400 });
  }

  if (body.type === "partner") {
    const partner = await prisma.partner.update({
      where: { id: body.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.logo !== undefined ? { logo: body.logo } : {}),
        ...(body.website !== undefined ? { website: body.website } : {}),
        ...(body.isActive !== undefined ? { isActive: !!body.isActive } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
      },
    });
    return NextResponse.json({ partner });
  }

  const testimonial = await prisma.testimonial.update({
    where: { id: body.id },
    data: {
      ...(body.authorName !== undefined ? { authorName: body.authorName } : {}),
      ...(body.company !== undefined ? { company: body.company } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.rating !== undefined ? { rating: Number(body.rating) } : {}),
      ...(body.isFeatured !== undefined ? { isFeatured: !!body.isFeatured } : {}),
      ...(body.isActive !== undefined ? { isActive: !!body.isActive } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: Number(body.sortOrder) } : {}),
    },
  });
  return NextResponse.json({ testimonial });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  if (!id || !type) {
    return NextResponse.json({ error: "id and type required" }, { status: 400 });
  }
  if (type === "partner") await prisma.partner.delete({ where: { id } });
  else await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
