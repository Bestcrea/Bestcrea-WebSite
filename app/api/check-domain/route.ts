import { NextRequest, NextResponse } from "next/server";
import { promises as dns } from "node:dns";

const DOMAIN_RE = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i;

/**
 * Best-effort availability check: a domain is considered "taken" if it has
 * NS or A/AAAA records (i.e. it resolves). If the resolver returns
 * ENOTFOUND/NXDOMAIN for every record type, we treat it as likely available.
 * This is indicative only (no registry WHOIS/RDAP contract), which is why
 * the UI phrases results as "likely available/unavailable".
 */
async function isDomainTaken(domain: string): Promise<boolean> {
  const checks: Array<Promise<unknown>> = [
    dns.resolveNs(domain),
    dns.resolve4(domain),
    dns.resolve6(domain),
  ];

  const results = await Promise.allSettled(checks);
  return results.some((result) => result.status === "fulfilled");
}

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get("domain")?.trim().toLowerCase() ?? "";

  if (!domain || !DOMAIN_RE.test(domain)) {
    return NextResponse.json({ error: "invalid domain" }, { status: 400 });
  }

  try {
    const taken = await isDomainTaken(domain);
    return NextResponse.json({ domain, available: !taken });
  } catch {
    return NextResponse.json({ error: "lookup failed" }, { status: 502 });
  }
}
