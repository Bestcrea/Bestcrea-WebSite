import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { OrganizationJsonLdBlock, WebsiteJsonLd } from "@/components/seo/json-ld";
import { routing, isRtlLocale } from "@/i18n/routing";
import { absoluteUrl, getPageSeo, getSiteSeoSettings, localizedPath } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = params.locale;
  const settings = await getSiteSeoSettings();
  const pageSeo = await getPageSeo("home", locale);

  const title = pageSeo?.title || settings.defaultTitle;
  const description = pageSeo?.description || settings.defaultDescription;
  const url = absoluteUrl(localizedPath(locale));

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, absoluteUrl(localizedPath(l))])
  );

  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: {
      default: title,
      template: `%s | ${settings.siteName}`,
    },
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: "website",
      locale,
      url,
      siteName: settings.siteName,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";
  const settings = await getSiteSeoSettings();
  const fontVars = isRtlLocale(locale)
    ? `${inter.variable} ${arabicFont.variable}`
    : inter.variable;

  return (
    <html lang={locale} dir={dir} className={fontVars}>
      <body
        className={`min-h-screen bg-background text-foreground antialiased ${
          isRtlLocale(locale) ? "font-arabic" : "font-sans"
        }`}
      >
        <OrganizationJsonLdBlock
          name={settings.siteName}
          description={settings.defaultDescription}
          url={absoluteUrl("/")}
        />
        <WebsiteJsonLd name={settings.siteName} url={absoluteUrl("/")} />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
