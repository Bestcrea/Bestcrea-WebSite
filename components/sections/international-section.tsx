import { getTranslations } from "next-intl/server";

const clients = [
  "NovaTech",
  "Atlas Retail",
  "Pulse Media",
  "GreenLeaf",
  "Orbit Pay",
  "Lumen Labs",
];

export async function InternationalSection() {
  const t = await getTranslations("HomePage.international");

  return (
    <section className="bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">{t("description")}</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {clients.map((client) => (
              <div
                key={client}
                className="grid h-16 place-items-center rounded-xl border border-primary/10 bg-primary/[0.03] text-sm font-semibold text-primary/70"
              >
                {client}
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary to-[#5a2a6b] p-6">
          <WorldMap />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(122,53,255,0.18),transparent_35%)]" />
        </div>
      </div>
    </section>
  );
}

function WorldMap() {
  return (
    <svg
      viewBox="0 0 800 420"
      className="relative z-10 h-auto w-full text-accent/80"
      aria-hidden
    >
      <ellipse
        cx="400"
        cy="210"
        rx="360"
        ry="180"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      <path
        d="M120 160c40-50 90-70 150-55 35 8 60 30 95 28 40-2 55-35 100-30 50 6 70 40 110 48 45 9 80-10 120 10 30 15 45 45 40 75-8 50-55 70-95 85-55 20-110 5-160 18-40 10-65 40-110 38-55-3-85-40-130-55-40-13-70 5-100-15-25-17-30-55-20-87z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="250" cy="170" r="6" fill="#7A35FF" />
      <circle cx="390" cy="190" r="6" fill="#7A35FF" />
      <circle cx="520" cy="165" r="6" fill="#7A35FF" />
      <circle cx="610" cy="210" r="6" fill="#7A35FF" />
      <circle cx="300" cy="250" r="6" fill="#7A35FF" />
    </svg>
  );
}
