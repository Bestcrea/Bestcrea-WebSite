import { Check, Code2, LayoutTemplate, Smartphone, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const promoServices = [
  { key: "web", icon: Code2 },
  { key: "mobile", icon: Smartphone },
  { key: "automation", icon: Sparkles },
] as const;

export async function PromoSection() {
  const t = await getTranslations("HomePage.promo");
  const offerFeatures = t.raw("saas.features") as string[];

  return (
    <section className="bg-[#F0F2F5] px-4 py-20 text-[#292D32] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#292D32]/70">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-[#292D32]/75">{t("description")}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {promoServices.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-[#292D32]/10 bg-white p-4 shadow-sm transition-colors hover:border-[#7A35FF]/50 hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#7A35FF] text-[#FFFFFF]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-semibold">
                  {t(`services.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-[#292D32]/65">
                  {t(`services.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-3xl border border-[#292D32]/10 bg-white p-6 text-[#292D32] shadow-lg lg:col-span-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#292D32]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#292D32]">
                <LayoutTemplate className="h-3.5 w-3.5 text-[#292D32]" aria-hidden />
                {t("saas.badge")}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-[#292D32]">{t("saas.title")}</h3>
            <p className="mt-2 text-sm text-[#292D32]/65">{t("saas.description")}</p>
            <p className="mt-6">
              <span className="text-4xl font-semibold tracking-tight text-[#292D32]">
                {t("saas.price")}
              </span>
            </p>
            <ul className="mt-6 space-y-3">
              {offerFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[#292D32]/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#292D32]" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button asChild variant="accent" className="mt-8 w-full">
              <Link href="/ressources/devis">{t("saas.cta")}</Link>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
