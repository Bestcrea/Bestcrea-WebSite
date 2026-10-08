import { getTranslations, setRequestLocale } from "next-intl/server";
import { DomainCheck } from "@/components/sections/domain-check";
import { absoluteUrl, localizedPath } from "@/lib/seo";

type Props = {
  params: { locale: string };
  searchParams: { q?: string };
};

export async function generateMetadata({ params }: Props) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "HomePage.domain",
  });
  const title = t("title");
  const description = t("description");
  const url = absoluteUrl(localizedPath(params.locale, "domaine"));

  return {
    title: {
      // Bypass layout `%s | Bestcrea` template so the tab shows the page phrase
      absolute: title,
    },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website" as const,
      locale: params.locale,
    },
  };
}

export default async function DomainePage({ params, searchParams }: Props) {
  setRequestLocale(params.locale);

  return <DomainCheck initialQuery={searchParams.q} />;
}
