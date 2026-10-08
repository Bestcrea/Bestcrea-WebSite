"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type CheckResult = {
  ok: boolean;
  domain?: string;
  available?: boolean;
  status?: string;
  message?: string;
};

const EXTENSIONS = [".com", ".ma", ".ai", ".io", ".net"] as const;

function withExtension(input: string, extension: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0];

  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  if (!cleaned) return "";

  const lastDot = cleaned.lastIndexOf(".");
  const base =
    lastDot > 0 && /^[a-z]{2,}$/i.test(cleaned.slice(lastDot + 1))
      ? cleaned.slice(0, lastDot)
      : cleaned;

  return `${base}${ext}`;
}

type DomainCheckProps = {
  initialQuery?: string;
};

export function DomainCheck({ initialQuery }: DomainCheckProps) {
  const t = useTranslations("HomePage.domain");
  const [domain, setDomain] = useState(initialQuery?.trim() ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const autoStarted = useRef(false);

  async function checkDomain(value: string) {
    const normalized = value.trim();
    if (!normalized) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/domain-check?domain=${encodeURIComponent(normalized)}`
      );
      const data = (await response.json()) as CheckResult;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        message: t("errorNetwork"),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = initialQuery?.trim();
    if (!q || autoStarted.current) return;
    autoStarted.current = true;
    setDomain(q);
    void checkDomain(q);
    // Run once on mount for ?q= prefill from header redirect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await checkDomain(domain);
  }

  function onExtensionClick(extension: string) {
    const next = withExtension(domain, extension);
    if (!next) return;
    setDomain(next);
    void checkDomain(next);
  }

  return (
    <section
      id="domain-check"
      className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #5a2a6b 0%, #292D32 42%, #220f2a 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 80%, rgba(122,53,255,0.08), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          {t("title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/70 sm:text-lg">
          {t("description")}
        </p>

        <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-2xl">
          <label htmlFor="domain-input" className="sr-only">
            {t("label")}
          </label>
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl shadow-black/25 ring-1 ring-black/5 sm:gap-3 sm:p-2">
            <Search
              className="ms-3 h-5 w-5 shrink-0 text-[#292D32]/45 sm:ms-4"
              aria-hidden
            />
            <input
              id="domain-input"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder={t("placeholder")}
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-[#292D32] outline-none placeholder:text-[#292D32]/40 sm:text-lg"
              required
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={loading || !domain.trim()}
              aria-label={t("cta")}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7A35FF] text-[#FFFFFF] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:w-12"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden />
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {EXTENSIONS.map((ext) => (
            <button
              key={ext}
              type="button"
              onClick={() => onExtensionClick(ext)}
              disabled={loading || !domain.trim()}
              className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {ext}
            </button>
          ))}
        </div>

        {result ? (
          <div
            className={cn(
              "mx-auto mt-8 flex max-w-xl items-start gap-3 rounded-2xl px-4 py-3.5 text-start text-sm sm:text-base",
              result.ok &&
                result.available &&
                "bg-[#7A35FF]/15 text-white ring-1 ring-[#7A35FF]/35",
              result.ok &&
                result.available === false &&
                "bg-white/10 text-white ring-1 ring-white/15",
              !result.ok && "bg-red-500/15 text-white ring-1 ring-red-400/35"
            )}
            role="status"
            aria-live="polite"
          >
            {result.ok && result.available ? (
              <>
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#7A35FF]"
                  aria-hidden
                />
                <span>{t("available", { domain: result.domain ?? domain })}</span>
              </>
            ) : null}
            {result.ok && result.available === false ? (
              <>
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
                <span>
                  {t("unavailable", { domain: result.domain ?? domain })}
                </span>
              </>
            ) : null}
            {!result.ok ? (
              <>
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-300" aria-hidden />
                <span>{result.message ?? t("errorGeneric")}</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
