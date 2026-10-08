export type CountryCard = {
  id: string;
  code: string;
  image: string;
  /** Translation key under HomePage.worldClientele.countries.* */
  nameKey: string;
  /** Approximate position (%) on world-map-bg, calibrated by eye against the dotted map. */
  left: number;
  top: number;
};

export type MapMarker = {
  id: string;
  left: number;
  top: number;
  /** HQ marker with halo + label */
  featured?: boolean;
  labelKey?: string;
};

/**
 * Country cards mapped from `downloads/Clientèle mondiale/pays/*` filenames.
 * Order follows visual storytelling: HQ first markets → expansion.
 */
export const WORLD_COUNTRIES: CountryCard[] = [
  {
    id: "france",
    code: "FR",
    image: "/images/countries/france.webp",
    nameKey: "france",
    left: 48.8,
    top: 33,
  },
  {
    id: "morocco",
    code: "MA",
    image: "/images/countries/morocco.webp",
    nameKey: "morocco",
    // HQ city (Rabat), not a generic country centroid — stays featured on the map.
    left: 47.4,
    top: 41.5,
  },
  {
    id: "usa",
    code: "US",
    image: "/images/countries/united-states.webp",
    nameKey: "usa",
    left: 22,
    top: 36,
  },
  {
    id: "uk",
    code: "UK",
    image: "/images/countries/united-kingdom.webp",
    nameKey: "uk",
    left: 47.2,
    top: 29,
  },
  {
    id: "uae",
    code: "AE",
    image: "/images/countries/uae.webp",
    nameKey: "uae",
    left: 61.2,
    top: 44.5,
  },
  {
    id: "thailand",
    code: "TH",
    image: "/images/countries/thailand.webp",
    nameKey: "thailand",
    left: 75.2,
    top: 49,
  },
  {
    id: "canada",
    code: "CA",
    image: "/images/countries/canada.webp",
    nameKey: "canada",
    left: 28.3,
    top: 33.8,
  },
  {
    id: "germany",
    code: "DE",
    image: "/images/countries/germany.webp",
    nameKey: "germany",
    left: 51.6,
    top: 30.2,
  },
  {
    id: "italy",
    code: "IT",
    image: "/images/countries/italy.webp",
    nameKey: "italy",
    left: 51.3,
    top: 35.6,
  },
  {
    id: "spain",
    code: "ES",
    image: "/images/countries/spain.webp",
    nameKey: "spain",
    left: 47.1,
    top: 36.3,
  },
  {
    id: "qatar",
    code: "QA",
    image: "/images/countries/qatar.webp",
    nameKey: "qatar",
    left: 61.5,
    top: 44.1,
  },
  {
    id: "saudiArabia",
    code: "SA",
    image: "/images/countries/saudi-arabia.webp",
    nameKey: "saudiArabia",
    left: 60.3,
    top: 44.4,
  },
];

/**
 * Discrete green dots on the dotted world map (no flag badges) — one per
 * WORLD_COUNTRIES entry. Morocco's dot sits at Rabat (the HQ) and stays
 * featured with a halo + label.
 */
export const WORLD_MAP_MARKERS: MapMarker[] = WORLD_COUNTRIES.map((country) => ({
  id: country.id,
  left: country.left,
  top: country.top,
  featured: country.id === "morocco",
  labelKey: country.id === "morocco" ? "rabat" : undefined,
}));
