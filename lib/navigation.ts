export type NavItem = {
  key: string;
  href: string;
};

export type MegaItem = {
  key: string;
  href: string;
  descriptionKey?: string;
  icon?: string;
};

export type MegaGroup = {
  key: string;
  icon?: string;
  items: MegaItem[];
};

export type MegaPromo = {
  eyebrowKey: string;
  titleKey: string;
  descriptionKey: string;
  ctaKey: string;
  href: string;
};

export const serviceCategories: MegaItem[] = [
  {
    key: "webDevelopment",
    href: "/services/web-development",
    descriptionKey: "webDevelopmentDesc",
    icon: "code",
  },
  {
    key: "mobileApps",
    href: "/services/mobile-apps",
    descriptionKey: "mobileAppsDesc",
    icon: "smartphone",
  },
  {
    key: "saas",
    href: "/services/saas",
    descriptionKey: "saasDesc",
    icon: "cloud",
  },
  {
    key: "wordpress",
    href: "/services/wordpress",
    descriptionKey: "wordpressDesc",
    icon: "globe",
  },
  {
    key: "migration",
    href: "/services/migration",
    descriptionKey: "migrationDesc",
    icon: "refresh",
  },
  {
    key: "aiAutomation",
    href: "/services/ai-automation",
    descriptionKey: "aiAutomationDesc",
    icon: "bot",
  },
  {
    key: "uiux",
    href: "/services/ui-ux",
    descriptionKey: "uiuxDesc",
    icon: "palette",
  },
  {
    key: "seo",
    href: "/services/seo",
    descriptionKey: "seoDesc",
    icon: "search",
  },
  {
    key: "hostingDomain",
    href: "/services/hosting-domain",
    descriptionKey: "hostingDomainDesc",
    icon: "server",
  },
  {
    key: "dataAnalytics",
    href: "/services/data-analytics",
    descriptionKey: "dataAnalyticsDesc",
    icon: "chart",
  },
  {
    key: "cybersecurity",
    href: "/services/cybersecurity",
    descriptionKey: "cybersecurityDesc",
    icon: "shield",
  },
  {
    key: "geolocation",
    href: "/services/geolocation",
    descriptionKey: "geolocationDesc",
    icon: "map",
  },
];

export const resourceItems: MegaItem[] = [
  {
    key: "stories",
    href: "/ressources/stories",
    descriptionKey: "storiesDesc",
    icon: "book",
  },
  {
    key: "temoignages",
    href: "/ressources/temoignages",
    descriptionKey: "temoignagesDesc",
    icon: "star",
  },
  {
    key: "portfolio",
    href: "/ressources/realisations",
    descriptionKey: "portfolioDesc",
    icon: "briefcase",
  },
  {
    key: "quote",
    href: "/ressources/devis",
    descriptionKey: "quoteDesc",
    icon: "file",
  },
  {
    key: "support",
    href: "/ressources/aide-support",
    descriptionKey: "supportDesc",
    icon: "lifeBuoy",
  },
  {
    key: "blog",
    href: "/ressources/blog",
    descriptionKey: "blogDesc",
    icon: "pen",
  },
  {
    key: "affiliation",
    href: "/ressources/affiliation",
    descriptionKey: "affiliationDesc",
    icon: "users",
  },
  {
    key: "paiement",
    href: "/ressources/moyens-paiement",
    descriptionKey: "paiementDesc",
    icon: "creditCard",
  },
  {
    key: "technologie",
    href: "/ressources/technologie",
    descriptionKey: "technologieDesc",
    icon: "cpu",
  },
  {
    key: "produits",
    href: "/ressources/produits-saas",
    descriptionKey: "produitsDesc",
    icon: "package",
  },
  {
    key: "newsletter",
    href: "/ressources/newsletter",
    descriptionKey: "newsletterDesc",
    icon: "mail",
  },
  {
    key: "checkDomain",
    href: "/ressources/verifier-domaine",
    descriptionKey: "checkDomainDesc",
    icon: "search",
  },
];

/** Hostinger-style left-rail groups — items reuse existing serviceCategories. */
export const serviceMegaGroups: MegaGroup[] = [
  {
    key: "groupBuild",
    icon: "code",
    items: serviceCategories.filter((item) =>
      ["webDevelopment", "mobileApps", "wordpress", "saas"].includes(item.key)
    ),
  },
  {
    key: "groupGrow",
    icon: "bot",
    items: serviceCategories.filter((item) =>
      ["aiAutomation", "uiux", "seo"].includes(item.key)
    ),
  },
  {
    key: "groupInfra",
    icon: "server",
    items: [
      ...serviceCategories.filter((item) => ["hostingDomain", "migration"].includes(item.key)),
      {
        key: "checkDomain",
        href: "/ressources/verifier-domaine",
        descriptionKey: "checkDomainDesc",
        icon: "search",
      },
    ],
  },
  {
    key: "groupAdvanced",
    icon: "shield",
    items: serviceCategories.filter((item) =>
      ["dataAnalytics", "cybersecurity", "geolocation"].includes(item.key)
    ),
  },
];

export const resourceMegaGroups: MegaGroup[] = [
  {
    key: "groupDiscover",
    icon: "book",
    items: resourceItems.filter((item) =>
      ["stories", "temoignages", "portfolio", "blog"].includes(item.key)
    ),
  },
  {
    key: "groupEngage",
    icon: "file",
    items: resourceItems.filter((item) =>
      ["quote", "affiliation", "support", "produits", "newsletter"].includes(item.key)
    ),
  },
  {
    key: "groupInfo",
    icon: "cpu",
    items: resourceItems.filter((item) =>
      ["technologie", "paiement", "checkDomain"].includes(item.key)
    ),
  },
];

export const servicesMegaPromo: MegaPromo = {
  eyebrowKey: "promoServicesEyebrow",
  titleKey: "promoServicesTitle",
  descriptionKey: "promoServicesDesc",
  ctaKey: "promoServicesCta",
  href: "/ressources/devis",
};

export const resourcesMegaPromo: MegaPromo = {
  eyebrowKey: "promoResourcesEyebrow",
  titleKey: "promoResourcesTitle",
  descriptionKey: "promoResourcesDesc",
  ctaKey: "promoResourcesCta",
  href: "/ressources/blog",
};

export const mainNav: NavItem[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "agency", href: "/agence" },
  { key: "resources", href: "/ressources" },
  { key: "contact", href: "/contact" },
];

export const localesMeta = [
  { code: "fr" as const, label: "FR", name: "Français" },
  { code: "en" as const, label: "EN", name: "English" },
  { code: "ar" as const, label: "AR", name: "العربية" },
  { code: "es" as const, label: "ES", name: "Español" },
  { code: "de" as const, label: "DE", name: "Deutsch" },
];
