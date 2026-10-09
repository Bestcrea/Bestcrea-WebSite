import { getTranslations, setRequestLocale } from "next-intl/server";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { GoogleReviewsSection } from "@/components/sections/google-reviews-section";
import { googleReviewsAverage, googleReviewsTotal } from "@/lib/google-reviews";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  return buildPageMetadata({ locale: params.locale, path: "ressources/temoignages" });
}

export default async function TemoignagesPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.resources.temoignages");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("title")} description={t("description")}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-3 shadow-sm">
            <span className="text-3xl font-bold text-primary">
              {googleReviewsAverage.toFixed(1)}
            </span>
            <div>
              <span className="flex items-center gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#FBBC05] text-[#FBBC05]" />
                ))}
              </span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {googleReviewsTotal} {t("reviewCountLabel")}
              </p>
            </div>
          </div>

          <Button asChild variant="accent">
            <a href="https://share.google/Iu8Q6AKPsrwi4kzqI" target="_blank" rel="noopener noreferrer">
              {t("leaveReviewCta")}
            </a>
          </Button>
        </div>
      </PageHero>

      <GoogleReviewsSection />

      <section className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-primary">{t("contactTitle")}</h2>
        <p className="mt-2 text-muted-foreground">{t("contactDescription")}</p>
        <div className="mt-6">
          <Button asChild variant="accent">
            <Link href="/ressources/devis">{t("contactCta")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
