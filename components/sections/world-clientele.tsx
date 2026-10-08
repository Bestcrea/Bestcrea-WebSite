import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { WORLD_COUNTRIES } from "@/lib/world-clientele";
import { cn } from "@/lib/utils";

export async function WorldClientele() {
  const t = await getTranslations("HomePage.worldClientele");
  const countryCount = WORLD_COUNTRIES.length;

  return (
    <section className="bg-[#F0F2F5] text-[#292D32]">
      {/* Part 2 — International reach + country cards */}
      <div className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8">
        <div
          className="pointer-events-none absolute -end-16 -top-10 h-64 w-64 opacity-15 sm:h-80 sm:w-80"
          aria-hidden
        >
          <Image
            src="/images/world-map-bg.webp"
            alt=""
            fill
            sizes="320px"
            className="object-contain"
            loading="lazy"
            unoptimized
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="flex gap-4">
            <span
              className="mt-1 hidden h-auto w-0.5 shrink-0 self-stretch bg-[#7A35FF] sm:block"
              aria-hidden
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#292D32]/70">
                {t("reachEyebrow")}
              </p>
              <h3 className="mt-3 text-2xl font-semibold uppercase tracking-tight text-[#292D32] sm:text-3xl md:text-4xl">
                {t("clientsTitle")}
              </h3>
              <p className="mt-2 max-w-2xl text-sm font-medium uppercase tracking-[0.08em] text-[#292D32]/90 sm:text-base md:text-lg">
                <span className="block text-[#292D32]/85">{t("clientsLine")}</span>
                <span className="mt-1 inline-block">
                  {t.rich("clientsInCountries", {
                    count: countryCount,
                    accent: (chunks) => (
                      <span className="relative mx-1 inline-block text-[#7A35FF]">
                        <span
                          className="absolute -top-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#7A35FF]"
                          aria-hidden
                        />
                        {chunks}
                      </span>
                    ),
                    underline: (chunks) => (
                      <span className="relative inline-block">
                        {chunks}
                        <span
                          className="absolute inset-x-0 -bottom-1 h-[2px] bg-[#7A35FF]"
                          aria-hidden
                        />
                      </span>
                    ),
                  })}
                </span>
              </p>
            </div>
          </div>

          <ul
            className={cn(
              "mt-10 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory",
              "sm:gap-4 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden"
            )}
          >
            {WORLD_COUNTRIES.map((country, index) => {
              const n = String(index + 1).padStart(2, "0");
              return (
                <li
                  key={country.id}
                  className="group relative h-56 w-[72vw] max-w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl sm:h-64 sm:w-56 md:w-auto md:max-w-none"
                >
                  <Image
                    src={country.image}
                    alt={t(`countries.${country.nameKey}`)}
                    fill
                    sizes="(max-width: 768px) 72vw, (max-width: 1024px) 33vw, 240px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    unoptimized
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10"
                    aria-hidden
                  />
                  <span className="absolute start-3 top-3 rounded-md bg-black/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ring-1 ring-white/15">
                    {country.code}
                  </span>
                  <span className="absolute end-3 top-3 text-xs font-medium tabular-nums text-white/90">
                    {n}
                  </span>
                  <span className="absolute inset-x-3 bottom-3 text-sm font-bold uppercase tracking-[0.12em] text-white">
                    {t(`countries.${country.nameKey}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
