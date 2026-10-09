import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { PAGE_SEO } from "@/lib/seo-pages";
import { absoluteUrl, getPageSeo, getSiteSeoSettings, localizedPath } from "@/lib/seo";

/** hreflang map for a path, including x-default (French). */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(localizedPath(l, path))])
  );
  languages["x-default"] = absoluteUrl(localizedPath(routing.defaultLocale, path));
  return languages;
}

export async function buildPageMetadata(options: {
  locale: string;
  path: string;
  pageKey?: string;
  /** Key of the targeted-SEO table (lib/seo-pages.ts). */
  seoKey?: string;
  title?: string;
  description?: string;
  keywords?: string;
  noindex?: boolean;
}): Promise<Metadata> {
  const settings = await getSiteSeoSettings();
  const pageSeo = options.pageKey ? await getPageSeo(options.pageKey, options.locale) : null;
  const preset = options.seoKey ? PAGE_SEO[options.seoKey]?.[options.locale] ?? PAGE_SEO[options.seoKey]?.fr : undefined;

  const title = options.title || preset?.title || pageSeo?.title || settings.defaultTitle;
  const description = options.description || preset?.description || pageSeo?.description || settings.defaultDescription;
  const keywords = options.keywords || preset?.keywords;
  const url = absoluteUrl(localizedPath(options.locale, options.path));

  return {
    // Absolute title: presets already end with the brand name.
    title: preset ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: url, languages: languageAlternates(options.path) },
    robots: options.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.siteName,
      locale: options.locale,
      type: "website",
      images: [{ url: absoluteUrl("/logo.png"), width: 512, height: 512, alt: settings.siteName }],
    },
    twitter: { card: "summary", title, description, images: [absoluteUrl("/logo.png")] },
  };
}
