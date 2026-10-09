"use client";

import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Service3DScene } from "@/components/sections/service-3d-scene";

export type ServiceCarouselItem = {
  key: string;
  href: string;
  title: string;
  slug: string;
  imageSrc: string | null;
  featured?: boolean;
};

type Props = {
  items: ServiceCarouselItem[];
  eyebrow: string;
  title: string;
  description: string;
  exploreLabel: string;
  prevLabel: string;
  nextLabel: string;
};

const cardTones = [
  "bg-[#292D32]",
  "bg-[#4A2356]",
  "bg-[#2D1436]",
  "bg-[#5A2A6B]",
  "bg-[#292D32]",
  "bg-[#24102E]",
  "bg-[#4A2356]",
  "bg-[#2D1436]",
  "bg-[#292D32]",
] as const;

const navBtnClass =
  "grid h-10 w-10 place-items-center rounded-full border border-primary/12 bg-background text-primary shadow-md shadow-primary/10 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground";

export function ServicesCarousel({
  items,
  eyebrow,
  title,
  description,
  exploreLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const card = node.querySelector<HTMLElement>("[data-service-card]");
    const delta = (card?.offsetWidth ?? 280) + 16;
    const rtl =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("dir") === "rtl";
    node.scrollBy({
      left: (rtl ? -direction : direction) * delta,
      behavior: "smooth",
    });
  }, []);

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">
          {eyebrow}
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <h2 className="min-w-0 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            {title}
          </h2>

          {/* Desktop / tablet only — mobile uses touch scroll */}
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label={prevLabel}
              className={navBtnClass}
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label={nextLabel}
              className={navBtnClass}
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
            </button>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>
      </div>

      <div
        ref={scrollerRef}
        className={cn(
          "mt-10 flex gap-4 overflow-x-auto scroll-smooth pb-2 pt-1",
          "snap-x snap-mandatory",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {items.map((item, index) => {
          const featured = Boolean(item.featured);
          return (
            <Link
              key={item.key}
              href={item.href}
              data-service-card
              className={cn(
                "group relative flex w-[272px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl",
                "transition-transform duration-300 hover:-translate-y-1",
                featured
                  ? "bg-accent text-accent-foreground"
                  : cardTones[index % cardTones.length]
              )}
            >
              <div className="flex min-h-[7.5rem] flex-col justify-between p-5 pb-3">
                <h3
                  className={cn(
                    "text-lg font-semibold leading-snug",
                    featured ? "text-accent-foreground" : "text-primary-foreground"
                  )}
                >
                  {item.title}
                </h3>
                <span
                  className={cn(
                    "mt-4 inline-flex text-sm font-medium opacity-80 transition-opacity group-hover:opacity-100",
                    featured ? "text-accent-foreground" : "text-primary-foreground"
                  )}
                >
                  {exploreLabel}
                  <span className="ms-1 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                    →
                  </span>
                </span>
              </div>

              <div className="px-3 pb-3">
                <div
                  className={cn(
                    "relative aspect-[5/4] overflow-hidden rounded-xl",
                    featured ? "bg-accent-foreground/10" : "bg-primary-foreground/10",
                    "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                  )}
                >
                  <Service3DScene slug={item.slug} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
