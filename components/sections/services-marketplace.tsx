import { existsSync } from "fs";
import path from "path";
import { getTranslations } from "next-intl/server";
import { serviceCategories } from "@/lib/navigation";
import {
  ServicesCarousel,
  type ServiceCarouselItem,
} from "@/components/sections/services-carousel";

/** Featured cards get cyber-green accent (#7A35FF). */
const FEATURED_SLUGS = new Set(["saas", "ai-automation"]);

function imageForSlug(slug: string): string | null {
  const webp = path.join(process.cwd(), "public/images/services", `${slug}.webp`);
  const png = path.join(process.cwd(), "public/images/services", `${slug}.png`);
  if (existsSync(webp)) return `/images/services/${slug}.webp`;
  if (existsSync(png)) return `/images/services/${slug}.png`;
  return null;
}

function slugFromHref(href: string): string {
  return href.replace(/^\/services\//, "");
}

export async function ServicesMarketplace() {
  const t = await getTranslations("HomePage.marketplace");
  const tNav = await getTranslations("Navigation");

  const items: ServiceCarouselItem[] = serviceCategories.map((item) => {
    const slug = slugFromHref(item.href);
    return {
      key: item.key,
      href: item.href,
      title: tNav(item.key),
      slug,
      imageSrc: imageForSlug(slug),
      featured: FEATURED_SLUGS.has(slug),
    };
  });

  return (
    <section id="services" className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ServicesCarousel
          items={items}
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          exploreLabel={t("explore")}
          prevLabel={t("prev")}
          nextLabel={t("next")}
        />
      </div>
    </section>
  );
}
