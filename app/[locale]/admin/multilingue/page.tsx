import { setRequestLocale } from "next-intl/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { params: { locale: string } };

const LOCALES = routing.locales;

function filledLocales(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => {
      if (typeof v === "string") return v.trim().length > 0;
      if (Array.isArray(v)) return v.length > 0;
      if (v && typeof v === "object") return Object.keys(v as object).length > 0;
      return false;
    })
    .map(([k]) => k);
}

type Row = { label: string; key: string; locales: string[] };

export default async function AdminMultilinguePage({ params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  if (!session) return null;

  const [services, posts, pages, plans] = await Promise.all([
    prisma.service.findMany({ select: { slug: true, title: true, excerpt: true, description: true } }),
    prisma.blogPost.findMany({ select: { slug: true, title: true, excerpt: true, content: true } }),
    prisma.pageContent.findMany({ select: { key: true, title: true, seoDescription: true, content: true } }),
    prisma.pricingPlan.findMany({ select: { slug: true, name: true, description: true, features: true } }),
  ]);

  const rows: Row[] = [
    ...services.map((s) => ({
      label: `Service · ${s.slug}`,
      key: s.slug,
      locales: Array.from(
        new Set([
          ...filledLocales(s.title),
          ...filledLocales(s.excerpt),
          ...filledLocales(s.description),
        ])
      ),
    })),
    ...posts.map((p) => ({
      label: `Blog · ${p.slug}`,
      key: p.slug,
      locales: Array.from(
        new Set([
          ...filledLocales(p.title),
          ...filledLocales(p.excerpt),
          ...filledLocales(p.content),
        ])
      ),
    })),
    ...pages.map((p) => ({
      label: `Page · ${p.key}`,
      key: p.key,
      locales: Array.from(
        new Set([
          ...filledLocales(p.title),
          ...filledLocales(p.seoDescription),
          ...filledLocales(p.content),
        ])
      ),
    })),
    ...plans.map((p) => ({
      label: `Pricing · ${p.slug}`,
      key: p.slug,
      locales: Array.from(
        new Set([
          ...filledLocales(p.name),
          ...filledLocales(p.description),
          ...filledLocales(p.features),
        ])
      ),
    })),
  ];

  const completion = LOCALES.map((loc) => {
    const complete = rows.filter((r) => r.locales.includes(loc)).length;
    const pct = rows.length ? Math.round((complete / rows.length) * 100) : 0;
    return { loc, complete, total: rows.length, pct };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Multilingue</h1>
        <p className="text-sm text-muted-foreground">
          Statut de complétion des contenus par langue.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {completion.map((c) => (
          <Card key={c.loc} className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                {c.loc}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-primary">{c.pct}%</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {c.complete}/{c.total} contenus
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${c.pct}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base">Détail par contenu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map((row) => (
            <div
              key={`${row.label}-${row.key}`}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/5 pb-3 last:border-0"
            >
              <p className="text-sm font-medium">{row.label}</p>
              <div className="flex flex-wrap gap-1">
                {LOCALES.map((loc) => (
                  <Badge
                    key={loc}
                    variant={row.locales.includes(loc) ? "success" : "secondary"}
                  >
                    {loc}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
