"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function AffiliationForm() {
  const t = useTranslations("Pages.resources.affiliation.form");
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
          company: data.get("website") || undefined,
          message: data.get("message"),
          source: "affiliation",
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
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl space-y-4 rounded-3xl border border-[#292D32]/10 bg-white p-6 shadow-sm sm:p-8"
    >
      <label className="block space-y-2 text-sm font-medium text-[#292D32]">
        <span>{t("name")}</span>
        <input
          name="name"
          type="text"
          required
          className="w-full rounded-xl border border-[#292D32]/15 bg-white px-3 py-2 text-sm outline-none ring-[#7A35FF] focus:ring-2"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-[#292D32]">
        <span>{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-[#292D32]/15 bg-white px-3 py-2 text-sm outline-none ring-[#7A35FF] focus:ring-2"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-[#292D32]">
        <span>{t("website")}</span>
        <input
          name="website"
          type="text"
          placeholder={t("websitePlaceholder")}
          className="w-full rounded-xl border border-[#292D32]/15 bg-white px-3 py-2 text-sm outline-none ring-[#7A35FF] focus:ring-2"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium text-[#292D32]">
        <span>{t("message")}</span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-xl border border-[#292D32]/15 bg-white px-3 py-2 text-sm outline-none ring-[#7A35FF] focus:ring-2"
        />
      </label>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#7A35FF] text-white hover:opacity-90 sm:w-auto"
      >
        {status === "loading" ? t("sending") : t("submit")}
      </Button>
      {status === "success" ? (
        <p className="text-sm font-medium text-[#292D32]">{t("success")}</p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-sm font-medium text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
