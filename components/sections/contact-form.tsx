"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const t = useTranslations("Pages.contact");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

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
          message: data.get("message"),
          source: "contact",
          locale,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || t("error"));
      }

      form.reset();
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-primary/10 bg-background p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("name")} name="name" required />
        <Field label={t("email")} name="email" type="email" required />
        <Field label={t("phone")} name="phone" type="tel" />
        <Field label={t("company")} name="company" />
      </div>
      <label className="block space-y-2 text-sm font-medium text-primary">
        <span>{t("message")}</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-primary/15 bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
        />
      </label>
      <Button type="submit" variant="accent" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? t("sending") : t("submit")}
      </Button>
      {status === "success" ? (
        <p className="text-sm font-medium text-primary">{t("success")}</p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}
    </form>
  );
}

function Field({
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
        className={cn(
          "w-full rounded-xl border border-primary/15 bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
        )}
      />
    </label>
  );
}
