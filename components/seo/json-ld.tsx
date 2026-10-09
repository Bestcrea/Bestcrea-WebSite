import { JsonLdScript, OrganizationJsonLd } from "next-seo";

type OrgProps = {
  name: string;
  description: string;
  url: string;
};

export function OrganizationJsonLdBlock({ name, description, url }: OrgProps) {
  return (
    <OrganizationJsonLd
      name={name}
      description={description}
      url={url}
      email="contact@bestcrea.com"
      telephone="+212636499140"
    />
  );
}

export function WebsiteJsonLd({ name, url }: { name: string; url: string }) {
  return (
    <JsonLdScript
      scriptKey="website"
      id="website-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
      }}
    />
  );
}

/** Local business / agency entity (Morocco) — helps local search and knowledge panel. */
export function LocalBusinessJsonLd({ name, url, description }: { name: string; url: string; description: string }) {
  return (
    <JsonLdScript
      scriptKey="local-business"
      id="local-business-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${url}#business`,
        name,
        url,
        description,
        image: `${url}logo.png`,
        logo: `${url}logo.png`,
        telephone: "+212636499140",
        email: "contact@bestcrea.com",
        priceRange: "1799 MAD - 5900 MAD",
        address: {
          "@type": "PostalAddress",
          streetAddress: "305 Rue Mohamed Zerktouni",
          addressLocality: "Khemisset",
          addressCountry: "MA",
        },
        areaServed: [{ "@type": "Country", name: "Morocco" }, "Worldwide"],
        availableLanguage: ["fr", "en", "ar", "es", "de"],
        knowsAbout: ["Web design", "SEO", "Google Ads", "Mobile app development", "SaaS development"],
      }}
    />
  );
}

type OfferPlan = { name: string; description: string; price: number; currency: string; url: string };

/** Pricing packs as schema.org Offers (rich results on the pricing page). */
export function PricingJsonLd({ plans }: { plans: OfferPlan[] }) {
  return (
    <JsonLdScript
      scriptKey="pricing"
      id="pricing-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: plans.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Service",
            name: p.name,
            description: p.description,
            provider: { "@type": "Organization", name: "Bestcrea" },
            areaServed: "MA",
            offers: {
              "@type": "Offer",
              price: p.price,
              priceCurrency: p.currency === "DH" ? "MAD" : p.currency,
              url: p.url,
              availability: "https://schema.org/InStock",
            },
          },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLdScript
      scriptKey="breadcrumb"
      id="breadcrumb-jsonld"
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
      }}
    />
  );
}
