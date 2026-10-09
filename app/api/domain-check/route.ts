import { NextRequest, NextResponse } from "next/server";
import { lookupDomain } from "@/lib/domain-lookup";

const DOMAIN_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0];
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("domain") ?? "";
  const domain = normalizeDomain(raw);

  if (!domain || !DOMAIN_REGEX.test(domain)) {
    return NextResponse.json(
      {
        ok: false,
        error: "invalid_domain",
        message: "Nom de domaine invalide.",
      },
      { status: 400 }
    );
  }

  const result = await lookupDomain(domain);
  if (!result) {
    return NextResponse.json(
      { ok: false, domain, error: "lookup_failed", message: "Vérification impossible pour le moment. Réessayez dans un instant." },
      { status: 502 }
    );
  }
  return NextResponse.json({
    ok: true,
    domain,
    available: result.available,
    status: result.available ? "available" : "unavailable",
    source: result.source,
    confirmed: result.confirmed,
    rdapStatus: result.rdapStatus ?? [],
    ldhName: domain.toUpperCase(),
  });
}
