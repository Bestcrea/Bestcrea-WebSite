import { NextRequest, NextResponse } from "next/server";

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

  try {
    const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "application/rdap+json, application/json",
      },
      // Avoid Next.js fetch caching of live domain status
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json({
        ok: true,
        domain,
        available: true,
        status: "available",
        source: "rdap.org",
      });
    }

    if (response.status === 200) {
      const data = (await response.json().catch(() => null)) as {
        ldhName?: string;
        status?: string[];
      } | null;

      return NextResponse.json({
        ok: true,
        domain,
        available: false,
        status: "unavailable",
        source: "rdap.org",
        rdapStatus: data?.status ?? [],
        ldhName: data?.ldhName ?? domain.toUpperCase(),
      });
    }

    return NextResponse.json(
      {
        ok: false,
        domain,
        error: "lookup_failed",
        message: `RDAP a renvoyé le statut ${response.status}.`,
      },
      { status: 502 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        domain,
        error: "network_error",
        message: "Impossible de joindre RDAP.org.",
      },
      { status: 502 }
    );
  }
}
