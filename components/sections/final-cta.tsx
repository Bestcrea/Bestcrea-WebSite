import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function FinalCta() {
  const t = await getTranslations("HomePage.finalCta");
  const phoneDisplay = "+212 636 499 140";
  const phoneHref = "tel:+212636499140";

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#292D32] px-6 py-14 text-white sm:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.4fr_auto]">
          <div>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-xl text-white/75">{t("description")}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button asChild variant="accent" size="lg" className="gap-2">
              <Link href="/ressources/devis">{t("cta")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-2 border border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <a href={phoneHref}>
                <Phone className="h-4 w-4 text-accent" aria-hidden />
                {phoneDisplay}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
