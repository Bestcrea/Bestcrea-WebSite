"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { currencyLabel } from "@/lib/currency";

export function QuoteRequestForm() {
  const t = useTranslations("Pages.resources.devis");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isCompany, setIsCompany] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone") || undefined,
          company: data.get("company") || undefined,
          message: `[Devis] ${data.get("service")} — ${data.get("budget")}\n\n${data.get("message")}`,
          source: "quote-request",
          locale,
          metadata: {
            city: data.get("city") || undefined,
            address: data.get("address") || undefined,
            isCompany,
            ice: isCompany ? data.get("ice") || undefined : undefined,
            rc: isCompany ? data.get("rc") || undefined : undefined,
          },
        }),
      });
      if (!response.ok) throw new Error("failed");
      form.reset();
      setIsCompany(false);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl space-y-4 rounded-3xl border border-primary/10 bg-background p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t("name")} name="name" required />
        <Input label={t("email")} name="email" type="email" required />
        <Input label={t("phone")} name="phone" />
        <Input label={t("city")} name="city" />
      </div>
      <Input label={t("address")} name="address" />

      <label className="flex items-center gap-2.5 text-sm font-medium text-primary">
        <input
          type="checkbox"
          checked={isCompany}
          onChange={(event) => setIsCompany(event.target.checked)}
          className="h-4 w-4 rounded border-primary/30 text-accent focus:ring-accent"
        />
        <span>{t("isCompany")}</span>
      </label>

      {isCompany ? (
        <div className="grid gap-4 rounded-2xl border border-primary/10 bg-primary/[0.02] p-4 sm:grid-cols-3">
          <Input label={t("company")} name="company" />
          <Input label={t("ice")} name="ice" />
          <Input label={t("rc")} name="rc" />
        </div>
      ) : null}

      <label className="block space-y-2 text-sm font-medium text-primary">
        <span>{t("service")}</span>
        <select
          name="service"
          required
          className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          defaultValue=""
        >
          <option value="" disabled>
            {t("servicePlaceholder")}
          </option>
          <option value="web-development">Web Development</option>
          <option value="mobile-apps">Mobile Apps</option>
          <option value="saas">SaaS</option>
          <option value="wordpress">WordPress</option>
          <option value="migration">Migration</option>
          <option value="ai-automation">AI & Automation</option>
          <option value="ui-ux">UI/UX</option>
          <option value="seo">SEO</option>
          <option value="hosting-domain">Hosting & Domain</option>
        </select>
      </label>
      <label className="block space-y-2 text-sm font-medium text-primary">
        <span>{t("budget")}</span>
        <select
          name="budget"
          required
          className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
          defaultValue=""
        >
          <option value="" disabled>
            {t("budgetPlaceholder")}
          </option>
          <option value="<3k">&lt; 3 000 {currencyLabel(locale)}</option>
          <option value="3-6k">3 000 – 6 000 {currencyLabel(locale)}</option>
          <option value="6-10k">6 000 – 10 000 {currencyLabel(locale)}</option>
          <option value="10k+">+ 10 000 {currencyLabel(locale)}</option>
        </select>
      </label>
      <label className="block space-y-2 text-sm font-medium text-primary">
        <span>{t("message")}</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
        />
      </label>
      <Button type="submit" variant="accent" disabled={status === "loading"}>
        {status === "loading" ? t("sending") : t("submit")}
      </Button>
      {status === "success" ? (
        <p className="text-sm font-medium text-primary">{t("success")}</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm font-medium text-red-600">{t("error")}</p>
      ) : null}
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-primary">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-primary/15 px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
      />
    </label>
  );
}
