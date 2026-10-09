import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { languageAlternates } from "@/lib/page-metadata";
import { absoluteUrl, LOCALES, localizedPath } from "@/lib/seo";

const STATIC_PATHS: { path: string; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
  { path: "", priority: 1, freq: "weekly" },
  { path: "services", priority: 0.9, freq: "weekly" },
  { path: "tarifs", priority: 0.9, freq: "weekly" },
  { path: "ressources/devis", priority: 0.8, freq: "monthly" },
  { path: "ressources/blog", priority: 0.8, freq: "weekly" },
  { path: "ressources/realisations", priority: 0.7, freq: "monthly" },
  { path: "agence", priority: 0.7, freq: "monthly" },
  { path: "contact", priority: 0.7, freq: "yearly" },
  { path: "domaine", priority: 0.6, freq: "monthly" },
  { path: "ressources", priority: 0.6, freq: "monthly" },
  { path: "ressources/technologie", priority: 0.6, freq: "monthly" },
  { path: "ressources/produits-saas", priority: 0.6, freq: "monthly" },
  { path: "ressources/moyens-paiement", priority: 0.5, freq: "yearly" },
  { path: "ressources/aide-support", priority: 0.5, freq: "monthly" },
  { path: "ressources/verifier-domaine", priority: 0.5, freq: "yearly" },
  { path: "ressources/stories", priority: 0.5, freq: "monthly" },
  { path: "ressources/temoignages", priority: 0.5, freq: "monthly" },
  { path: "ressources/affiliation", priority: 0.4, freq: "yearly" },
];

function entry(path: string, lastModified: Date, freq: "weekly" | "monthly" | "yearly", priority: number, locale: string) {
  return {
    url: absoluteUrl(localizedPath(locale, path)),
    lastModified,
    changeFrequency: freq,
    priority,
    alternates: { languages: languageAlternates(path) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const locale of LOCALES) {
    for (const s of STATIC_PATHS) entries.push(entry(s.path, now, s.freq, s.priority, locale));
  }

  try {
    const [services, posts] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
    ]);
    for (const locale of LOCALES) {
      for (const sv of services) entries.push(entry(`services/${sv.slug}`, sv.updatedAt, "monthly", 0.8, locale));
      for (const post of posts)
        entries.push(entry(`ressources/blog/${post.slug}`, post.updatedAt || post.publishedAt || now, "weekly", 0.6, locale));
    }
  } catch {
    // DB unavailable at build time: static entries remain.
  }
  return entries;
}
