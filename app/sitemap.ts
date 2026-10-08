import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, LOCALES, localizedPath } from "@/lib/seo";

const STATIC_PATHS = [
  "",
  "services",
  "agence",
  "contact",
  "domaine",
  "ressources",
  "ressources/stories",
  "ressources/realisations",
  "ressources/devis",
  "ressources/aide-support",
  "ressources/blog",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, path)),
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const [services, posts] = await Promise.all([
      prisma.service.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
    ]);

    for (const locale of LOCALES) {
      for (const service of services) {
        entries.push({
          url: absoluteUrl(localizedPath(locale, `services/${service.slug}`)),
          lastModified: service.updatedAt,
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
      for (const post of posts) {
        entries.push({
          url: absoluteUrl(localizedPath(locale, `ressources/blog/${post.slug}`)),
          lastModified: post.updatedAt || post.publishedAt || new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB may be unavailable at build time in some hosts — static entries remain.
  }

  return entries;
}
