/**
 * Domain availability lookup with fallbacks:
 *  1. Registry RDAP found through the IANA bootstrap file (direct, not via the rdap.org proxy which blocks hosting IPs with 403).
 *  2. rdap.org as a secondary RDAP source.
 *  3. DNS-over-HTTPS (Cloudflare, then Google): NXDOMAIN => probably available. Used for TLDs without RDAP such as .ma.
 */
const UA = "Bestcrea-DomainCheck/1.0 (+https://bestcrea.com)";

export type LookupResult = {
  available: boolean;
  source: string;
  /** false when the answer comes from DNS only (no registry confirmation). */
  confirmed: boolean;
  rdapStatus?: string[];
};

async function timedFetch(url: string, init: RequestInit = {}, ms = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": UA, ...(init.headers ?? {}) } });
  } finally {
    clearTimeout(timer);
  }
}

let bootstrap: { at: number; map: Map<string, string> } | null = null;

async function rdapBaseFor(tld: string): Promise<string | null> {
  if (!bootstrap || Date.now() - bootstrap.at > 24 * 3600 * 1000) {
    try {
      const res = await timedFetch("https://data.iana.org/rdap/dns.json", { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = (await res.json()) as { services: [string[], string[]][] };
        const map = new Map<string, string>();
        for (const [tlds, urls] of data.services) for (const t of tlds) map.set(t.toLowerCase(), urls.find((u) => u.startsWith("https")) ?? urls[0]);
        bootstrap = { at: Date.now(), map };
      }
    } catch {
      /* use stale/no bootstrap */
    }
  }
  return bootstrap?.map.get(tld) ?? null;
}

async function rdapQuery(base: string, domain: string, source: string): Promise<LookupResult | null> {
  try {
    const url = `${base.replace(/\/?$/, "/")}domain/${encodeURIComponent(domain)}`;
    const res = await timedFetch(url, { headers: { Accept: "application/rdap+json, application/json" }, cache: "no-store", redirect: "follow" });
    if (res.status === 404) return { available: true, source, confirmed: true };
    if (res.status === 200) {
      const data = (await res.json().catch(() => null)) as { status?: string[] } | null;
      return { available: false, source, confirmed: true, rdapStatus: data?.status ?? [] };
    }
  } catch {
    /* fall through */
  }
  return null;
}

async function dohQuery(domain: string): Promise<LookupResult | null> {
  const endpoints = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=NS`,
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=NS`,
  ];
  for (const url of endpoints) {
    try {
      const res = await timedFetch(url, { headers: { Accept: "application/dns-json" }, cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as { Status: number; Answer?: unknown[]; Authority?: unknown[] };
      if (data.Status === 3) return { available: true, source: "dns", confirmed: false };
      if (data.Status === 0) return { available: false, source: "dns", confirmed: false };
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function lookupDomain(domain: string): Promise<LookupResult | null> {
  const tld = domain.split(".").pop()!.toLowerCase();
  const base = await rdapBaseFor(tld);
  if (base) {
    const r = await rdapQuery(base, domain, "rdap");
    if (r) return r;
  }
  const proxy = await rdapQuery("https://rdap.org/", domain, "rdap.org");
  if (proxy) return proxy;
  return dohQuery(domain);
}
