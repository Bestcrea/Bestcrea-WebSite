export type PortfolioSite = {
  slug: string;
  name: string;
  url: string;
  /** Path under /public/images/portfolio/, or a remote screenshot URL. */
  screenshot: string;
  category: string;
};

/**
 * Auto-generates a live screenshot preview via the free WordPress mshots
 * service (no API key, no rate limit issue at this volume). On the very
 * first request for a given URL it can return a gray "Generating…"
 * placeholder for a minute or two while it renders in the background —
 * after that it's cached and loads instantly.
 */
function mshot(url: string) {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=900`;
}

/**
 * Real websites built by Bestcrea, shown as browser preview cards on the
 * homepage (first 6) and on the full "Réalisations" page.
 */
export const portfolioSites: PortfolioSite[] = [
  {
    slug: "bold-beauty-lounge",
    name: "Bold Beauty Lounge",
    url: "https://boldbeautylounge.com",
    screenshot: mshot("https://boldbeautylounge.com"),
    category: "Beauté & bien-être",
  },
  {
    slug: "lasco-energy",
    name: "Lasco Energy",
    url: "https://lascofenergy.com",
    screenshot: mshot("https://lascofenergy.com"),
    category: "Électricité & énergie",
  },
  {
    slug: "mymoussaid",
    name: "MyMoussaid",
    url: "https://mymoussaid.com",
    screenshot: mshot("https://mymoussaid.com"),
    category: "Architecture & urbanisme",
  },
  {
    slug: "souaidi-immo",
    name: "Souaidi Immobilier",
    url: "https://souaidi-immo.ma",
    screenshot: mshot("https://souaidi-immo.ma"),
    category: "Immobilier",
  },
  {
    slug: "delivery-kech",
    name: "Delivery Kech",
    url: "https://deliverykech.com",
    screenshot: mshot("https://deliverykech.com"),
    category: "Livraison & logistique",
  },
  {
    slug: "careoto",
    name: "Careoto",
    url: "https://careoto.ma",
    screenshot: mshot("https://careoto.ma"),
    category: "E-commerce auto",
  },
  {
    slug: "my-fragrance",
    name: "My Fragrance",
    url: "https://myfragrance.ma",
    screenshot: mshot("https://myfragrance.ma"),
    category: "E-commerce parfumerie",
  },
  {
    slug: "babaafric",
    name: "BabaAfric",
    url: "https://babaafric.ma",
    screenshot: mshot("https://babaafric.ma"),
    category: "Petites annonces",
  },
  {
    slug: "construction-estimating",
    name: "Construction Estimating",
    url: "https://constructionestimating.ma",
    screenshot: mshot("https://constructionestimating.ma"),
    category: "BTP & estimation",
  },
  {
    slug: "profexcellent",
    name: "ProfExcellent",
    url: "https://profexcellent.net",
    screenshot: mshot("https://profexcellent.net"),
    category: "Éducation",
  },
  {
    slug: "the-door-of-the-world",
    name: "The Door of the World",
    url: "https://thedooroftheworld.ma",
    screenshot: mshot("https://thedooroftheworld.ma"),
    category: "Voyage & Omra",
  },
  {
    slug: "dpharma",
    name: "D-Pharma",
    url: "https://dpharma.ma",
    screenshot: mshot("https://dpharma.ma"),
    category: "Pharmacie",
  },
  {
    slug: "aluglas",
    name: "Aluglas",
    url: "https://aluglas.ma",
    screenshot: mshot("https://aluglas.ma"),
    category: "Menuiserie aluminium",
  },
  {
    slug: "ouafi-solutions",
    name: "OUAFI Solutions",
    url: "https://ouafisolution.ma",
    screenshot: mshot("https://ouafisolution.ma"),
    category: "Traitement des eaux",
  },
  {
    slug: "bist",
    name: "Bist",
    url: "https://bist.ma",
    screenshot: mshot("https://bist.ma"),
    category: "Site professionnel",
  },
  {
    slug: "swix",
    name: "Swix",
    url: "https://swix.pro",
    screenshot: mshot("https://swix.pro"),
    category: "Site professionnel",
  },
  {
    slug: "cist",
    name: "Cist",
    url: "https://cist.ma",
    screenshot: mshot("https://cist.ma"),
    category: "Site professionnel",
  },
  {
    slug: "yourent",
    name: "YouRent",
    url: "https://www.yourent.ma",
    screenshot: mshot("https://www.yourent.ma"),
    category: "Location de voitures",
  },
  {
    slug: "mluxury",
    name: "MLuxury",
    url: "https://mluxury.ma",
    screenshot: mshot("https://mluxury.ma"),
    category: "Luxe",
  },
  {
    slug: "monvoyage",
    name: "Mon Voyage",
    url: "https://monvoyage.ma",
    screenshot: mshot("https://monvoyage.ma"),
    category: "Agence de voyage",
  },
  {
    slug: "morocco-travel-igoudan",
    name: "Morocco Travel Igoudan",
    url: "https://www.moroccotraveligoudan.com",
    screenshot: mshot("https://www.moroccotraveligoudan.com"),
    category: "Agence de voyage",
  },
  {
    slug: "dr-berrada-khalid",
    name: "Dr Berrada Khalid",
    url: "https://drberradakhalid.com",
    screenshot: mshot("https://drberradakhalid.com"),
    category: "Santé / Cabinet médical",
  },
  {
    slug: "dr-michraf",
    name: "Dr Michraf",
    url: "https://www.drmichraf.com",
    screenshot: mshot("https://www.drmichraf.com"),
    category: "Santé / Cabinet médical",
  },
  {
    slug: "dr-bhihi-esthetique",
    name: "Dr Bhihi Esthétique",
    url: "https://drbhihi-esthetique.com",
    screenshot: mshot("https://drbhihi-esthetique.com"),
    category: "Médecine esthétique",
  },
  {
    slug: "guess-clinic",
    name: "Guess Clinic",
    url: "https://www.guessclinic.com",
    screenshot: mshot("https://www.guessclinic.com"),
    category: "Médecine esthétique",
  },
];

/** Unique category list, derived from portfolioSites — updates automatically as sites are added. */
export function getPortfolioCategories(): string[] {
  return Array.from(new Set(portfolioSites.map((site) => site.category)));
}
