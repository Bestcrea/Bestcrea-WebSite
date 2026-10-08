"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const suggestedTlds = [".com", ".ma", ".net", ".org", ".info"];

type Result = { domain: string; available: boolean } | null;

export function DomainChecker() {
  const t = useTranslations("Pages.resources.checkDomain");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Result>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const domain = value.trim().toLowerCase();
    if (!domain) return;

    setStatus("loading");
    setResult(null);

    try {
      const response = await fetch(`/api/check-domain?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) throw new Error("failed");
      const data = (await response.json()) as { domain: string; available: boolean };
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("inputPlaceholder")}
          className="w-full rounded-xl border border-primary/15 px-4 py-3 text-sm outline-none ring-accent focus:ring-2"
          required
        />
        <Button type="submit" variant="accent" disabled={status === "loading"} className="shrink-0">
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
          {t("checkButton")}
        </Button>
      </form>

      <p className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {suggestedTlds.map((tld) => (
          <span key={tld} className="rounded-full bg-primary/5 px-2.5 py-1">
            {tld}
          </span>
        ))}
      </p>

      {status === "error" ? (
        <p className="mt-6 text-sm font-medium text-red-600">{t("errorInvalid")}</p>
      ) : null}

      {status === "done" && result ? (
        <div
          className={`mt-6 flex flex-col items-start gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
            result.available
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.available ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600" aria-hidden />
            ) : (
              <XCircle className="h-6 w-6 shrink-0 text-amber-600" aria-hidden />
            )}
            <div>
              <p className="font-semibold text-primary">{result.domain}</p>
              <p className="text-sm text-muted-foreground">
                {result.available ? t("available") : t("unavailable")}
              </p>
            </div>
          </div>

          {result.available ? (
            <Button asChild variant="accent" className="shrink-0">
              <Link href="/ressources/devis">{t("ctaRegister")}</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-xs text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
