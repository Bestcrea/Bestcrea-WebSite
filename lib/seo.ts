import { prisma } from "@/lib/prisma";
import { pickLocale } from "@/lib/i18n-content";
import { routing } from "@/i18n/routing";

export type SiteSeoSettings = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
};

const DEFAULT_SEO: SiteSeoSettings = {
  siteName: "Bestcrea",
  defaultTitle: "Bestcrea — Agence digitale premium",
  defaultDescription: "Design, développement, SaaS et automatisation.",
};

export async function getSiteSeoSettings(): Promise<SiteSeoSettings> {
  try {
    const page = await prisma.pageContent.findUnique({
      where: { key: "site.settings" },
    });
    const content = page?.content as { seo?: Partial<SiteSeoSettings> } | null;
    return {
      ...DEFAULT_SEO,
      ...(content?.seo || {}),
    };
  } catch {
    return DEFAULT_SEO;
  }
}

export async function getPageSeo(key: string, locale: string) {
  try {
    const page = await prisma.pageContent.findUnique({ where: { key } });
    if (!page) return null;
    return {
      title: pickLocale(page.title as never, locale),
      description: pickLocale(page.seoDescription as never, locale),
    };
  } catch {
    return null;
  }
}

export function absoluteUrl(path = "/") {
  const base = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function localizedPath(locale: string, path = "") {
  const clean = path.replace(/^\//, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

export const LOCALES = routing.locales;
