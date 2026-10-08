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
  const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const title = body.title ?? { fr: body.titleFr || "Article" };
    const slug = body.slug?.trim() || slugify(title.fr || "article");

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt: body.excerpt ?? body.seoDescription ?? null,
        content: body.content ?? { fr: "" },
        tags: body.tags ?? [],
        coverImage: body.coverImage || null,
        isPublished: !!body.isPublished,
        publishedAt: body.isPublished ? new Date() : null,
        authorId: auth.session.user.id,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const post = await prisma.blogPost.update({
      where: { id: body.id },
      data: {
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
        ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}),
        ...(body.isPublished !== undefined
          ? {
              isPublished: !!body.isPublished,
              publishedAt: body.isPublished ? new Date() : null,
            }
          : {}),
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.blogPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
