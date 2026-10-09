"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function TicketForm() {
  const t = useTranslations("ClientPortal.support");
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.get("subject"),
          description: data.get("description"),
          priority: data.get("priority"),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || t("error"));
      }
      form.reset();
      router.refresh();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("error"));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-primary">{t("newTicket")}</h2>
      <label className="block text-sm font-medium text-neutral-800">
        <span>{t("subject")}</span>
        <input name="subject" required className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#7A35FF] focus:ring-2 focus:ring-[#7A35FF]/20" />
      </label>
      <label className="block text-sm font-medium text-neutral-800">
        <span>{t("priority")}</span>
        <select name="priority" defaultValue="medium" className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#7A35FF] focus:ring-2 focus:ring-[#7A35FF]/20">
          <option value="low">{t("priorities.low")}</option>
          <option value="medium">{t("priorities.medium")}</option>
          <option value="high">{t("priorities.high")}</option>
          <option value="urgent">{t("priorities.urgent")}</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-neutral-800">
        <span>{t("description")}</span>
        <textarea name="description" required rows={4} className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#7A35FF] focus:ring-2 focus:ring-[#7A35FF]/20" />
      </label>
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button type="submit" variant="accent" disabled={status === "loading"}>
        {status === "loading" ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
