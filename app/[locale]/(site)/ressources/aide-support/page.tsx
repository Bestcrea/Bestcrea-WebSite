import { getTranslations, setRequestLocale } from "next-intl/server";
import { LifeBuoy } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";

type Props = { params: { locale: string } };

export default async function AideSupportPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.aide");

  const faqs = [0, 1, 2, 3].map((i) => ({
    q: t(`faqs.${i}.q`),
    a: t(`faqs.${i}.a`),
  }));

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <section className="px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl bg-[#0B0A1F] px-6 py-10 text-center sm:flex-row sm:text-start">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#7A35FF] text-white">
            <LifeBuoy className="h-7 w-7" aria-hidden />
          </span>
          <div className="flex-1">
            <p className="text-lg font-semibold text-white">{t("bannerTitle")}</p>
            <p className="text-sm font-medium text-[#C9A9FF]">{t("bannerSubtitle")}</p>
            <p className="mt-2 text-sm text-white/60">{t("bannerDescription")}</p>
          </div>
          <Button asChild variant="accent" className="shrink-0">
            <Link href="/contact">{t("bannerCta")}</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-4 px-4 py-16 sm:px-6 lg:px-8">
        {faqs.map((faq) => (
          <article key={faq.q} className="rounded-2xl border border-primary/10 p-5">
            <h2 className="font-semibold text-primary">{faq.q}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
          </article>
        ))}
        <div className="pt-6">
          <Button asChild variant="accent">
            <Link href="/contact">{t("cta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
