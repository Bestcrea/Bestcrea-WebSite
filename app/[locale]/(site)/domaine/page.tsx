import { getTranslations, setRequestLocale } from "next-intl/server";
import { DomainCheck } from "@/components/sections/domain-check";
import { absoluteUrl, localizedPath } from "@/lib/seo";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
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

export default async function DomainePage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  setRequestLocale(params.locale);

  return <DomainCheck initialQuery={searchParams.q} />;
}
