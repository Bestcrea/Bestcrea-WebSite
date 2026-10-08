import type { Metadata } from "next";
import { absoluteUrl, getPageSeo, getSiteSeoSettings, localizedPath } from "@/lib/seo";

export async function buildPageMetadata(options: {
  locale: string;
  path: string;
  pageKey?: string;
  title?: string;
  description?: string;
}): Promise<Metadata> {
  const settings = await getSiteSeoSettings();
  const pageSeo = options.pageKey
    ? await getPageSeo(options.pageKey, options.locale)
    : null;

  const title = options.title || pageSeo?.title || settings.defaultTitle;
  const description =
    options.description || pageSeo?.description || settings.defaultDescription;
  const url = absoluteUrl(localizedPath(options.locale, options.path));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.siteName,
      locale: options.locale,
      type: "website",
    },
  };
}
