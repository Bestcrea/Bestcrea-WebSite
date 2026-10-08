import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";

export async function PartnersMarquee() {
  const t = await getTranslations("HomePage.partners");
  const partners = await prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, logo: true, website: true },
  });

  if (partners.length === 0) return null;

  const loop = [...partners, ...partners];

  return (
    <section className="overflow-hidden border-t border-primary/5 bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary md:text-3xl">
          {t("title")}
        </h2>
      </div>

      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex min-w-full shrink-0 items-center gap-6 py-2 motion-reduce:animate-none">
            {loop.map((partner, index) => {
              const content = (
                <div className="group flex h-12 w-[120px] shrink-0 items-center justify-center">
                  {partner.logo ? (
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={120}
                      height={48}
                      className="h-12 w-[120px] object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-semibold tracking-wide text-primary/65">
                      {partner.name}
                    </span>
                  )}
                </div>
              );

              return partner.website ? (
                <a
                  key={`${partner.id}-${index}`}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={partner.name}
                  className="shrink-0"
                >
                  {content}
                </a>
              ) : (
                <div key={`${partner.id}-${index}`} className="shrink-0">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
