import { Check, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickLocale, pickLocaleList } from "@/lib/i18n-content";
import { currencyLabel } from "@/lib/currency";
import { cn } from "@/lib/utils";

export type PricingPlanCard = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  features: unknown;
  ctaLabel: unknown;
  price: string;
  originalPrice: string | null;
  discountAmount: string | null;
  currency: string;
  billingPeriod: string;
  isFeatured: boolean;
};

type Props = {
  plans: PricingPlanCard[];
  locale: string;
};

function formatAmount(value: string | number, locale: string) {
  return Number(value).toLocaleString(locale, { maximumFractionDigits: 0 });
}

function discountPercent(price: string, originalPrice: string | null) {
  const current = Number(price);
  const original = Number(originalPrice);
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export async function PricingPlans({ plans, locale }: Props) {
  const t = await getTranslations("HomePage.pricing");

  // Every feature offered by at least one plan, in first-seen order. A plan "does not include"
  // the features that other plans have but it lacks — derived from the data, no extra setup.
  const featuresByPlan = plans.map((plan) => pickLocaleList(plan.features, locale));
  const allFeatures = Array.from(new Set(featuresByPlan.flat()));

  return (
    <section className="bg-[#F4F4F5] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#292D32]/60">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#292D32] md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-neutral-600">{t("description")}</p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-5">
          {plans.map((plan, planIndex) => {
            const name = pickLocale(plan.name as never, locale, plan.slug);
            const description = pickLocale(plan.description as never, locale);
            const features = featuresByPlan[planIndex];
            const cta = pickLocale(plan.ctaLabel as never, locale) || t("cta");
            const off = discountPercent(plan.price, plan.originalPrice);
            const dark = plan.isFeatured;

            return (
              <article
                key={plan.id}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out hover:-translate-y-1.5 sm:p-7",
                  dark
                    ? "bg-gradient-to-b from-[#241046] via-[#170B2E] to-[#0E0720] text-white shadow-[0_24px_60px_-18px_rgba(122,53,255,0.55)] hover:shadow-[0_32px_70px_-14px_rgba(122,53,255,0.7)]"
                    : "border border-black/5 bg-white text-[#111111] shadow-[0_8px_30px_rgba(41,45,50,0.08)] hover:border-[#7A35FF]/40 hover:shadow-[0_28px_60px_-12px_rgba(122,53,255,0.3)]"
                )}
              >
                {/* Hover colour animation */}
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    dark
                      ? "bg-gradient-to-br from-[#7A35FF]/25 via-transparent to-[#FF6AD5]/20"
                      : "bg-gradient-to-br from-[#7A35FF]/0 via-[#7A35FF]/[0.06] to-[#FF6AD5]/[0.12]"
                  )}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#7A35FF] via-[#FF6AD5] to-[#7A35FF] bg-[length:200%_100%] transition-transform duration-500 group-hover:scale-x-100 group-hover:animate-gradient-x"
                />

                <div className="relative flex min-h-[2rem] justify-end">
                  {off > 0 || dark ? (
                    <span
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-semibold",
                        dark ? "bg-white/10 text-[#CDB6FF]" : "bg-[#7A35FF]/10 text-[#6A2BE0]"
                      )}
                    >
                      {dark ? `${t("popular")}${off > 0 ? ` · -${off}%` : ""}` : `-${off}% OFF`}
                    </span>
                  ) : null}
                </div>

                <h3 className="relative mt-1 min-h-[3.5rem] text-2xl font-bold leading-tight">{name}</h3>
                <p
                  className={cn(
                    "relative mt-2 min-h-[6.5rem] text-[15px] leading-relaxed",
                    dark ? "text-white/75" : "text-neutral-600"
                  )}
                >
                  {description}
                </p>

                <p
                  className={cn(
                    "relative mt-5 min-h-[1.5rem] text-base line-through",
                    dark ? "text-white/45" : "text-neutral-400"
                  )}
                >
                  {plan.originalPrice
                    ? `${formatAmount(plan.originalPrice, locale)} ${currencyLabel(locale, plan.currency)}`
                    : null}
                </p>
                <p className="relative flex items-end gap-1.5">
                  <span className="text-5xl font-bold tracking-tight">{formatAmount(plan.price, locale)}</span>
                  <span className={cn("pb-1.5 text-lg font-medium", dark ? "text-white/70" : "text-neutral-500")}>
                    {currencyLabel(locale, plan.currency)}
                  </span>
                </p>

                <Link
                  href={`/checkout?plan=${plan.slug}`}
                  className={cn(
                    "relative mt-6 inline-flex w-full items-center justify-center rounded-lg px-5 py-3.5 text-base font-semibold transition-all duration-300",
                    dark
                      ? "bg-[#7A35FF] text-white hover:bg-[#8B4DFF] hover:shadow-lg hover:shadow-[#7A35FF]/40"
                      : "border border-[#7A35FF] bg-white text-[#7A35FF] hover:bg-[#7A35FF] hover:text-white hover:shadow-lg hover:shadow-[#7A35FF]/30"
                  )}
                >
                  {cta}
                </Link>

                <p
                  className={cn(
                    "relative mt-4 min-h-[1.25rem] text-sm",
                    dark ? "text-white/60" : "text-neutral-500"
                  )}
                >
                  {plan.discountAmount ? t("save", { amount: formatAmount(plan.discountAmount, locale) }) : null}
                </p>

                <div className={cn("relative my-5 h-px", dark ? "bg-white/10" : "bg-black/10")} />

                <p className="relative text-sm font-bold">{t("includes")}</p>
                <ul className="relative mt-4 flex-1 space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className={cn("flex items-start gap-2.5 text-[15px]", dark ? "text-white/90" : "text-neutral-800")}>
                      <Check
                        className={cn(
                          "mt-0.5 h-[18px] w-[18px] shrink-0 transition-colors duration-300",
                          dark ? "text-[#B58CFF]" : "text-[#1F8A4C] group-hover:text-[#7A35FF]"
                        )}
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

              </article>
            );
          })}
        </div>

        {plans.length > 1 && allFeatures.length > 0 ? (
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="text-center">
              <h3 className="text-2xl font-semibold tracking-tight text-[#292D32]">{t("compareTitle")}</h3>
              <p className="mt-2 text-neutral-600">{t("compareDescription")}</p>
            </div>

            <div className="mt-8 overflow-x-auto rounded-3xl border border-black/5 bg-white shadow-[0_8px_30px_rgba(41,45,50,0.06)]">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="p-4 text-start font-semibold text-[#292D32]/60">{t("feature")}</th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        className={cn(
                          "p-4 text-center align-bottom",
                          plan.isFeatured && "bg-[#7A35FF]/[0.06]"
                        )}
                      >
                        <span className="block text-base font-bold text-[#111111]">
                          {pickLocale(plan.name as never, locale, plan.slug)}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-neutral-500">
                          {formatAmount(plan.price, locale)} {currencyLabel(locale, plan.currency)}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((feature) => (
                    <tr key={feature} className="group/row border-t border-black/5 transition-colors hover:bg-[#7A35FF]/[0.04]">
                      <td className="p-4 text-neutral-700">{feature}</td>
                      {plans.map((plan, i) => {
                        const has = featuresByPlan[i].includes(feature);
                        return (
                          <td key={plan.id} className={cn("p-4 text-center", plan.isFeatured && "bg-[#7A35FF]/[0.06]")}>
                            {has ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1F8A4C]">
                                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden />
                                <span className="sr-only">{t("yes")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200">
                                <X className="h-3.5 w-3.5 text-neutral-500" strokeWidth={3} aria-hidden />
                                <span className="sr-only">{t("no")}</span>
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
