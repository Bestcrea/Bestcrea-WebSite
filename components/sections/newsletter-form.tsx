"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  const t = useTranslations("Pages.resources.newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter",
          email,
          message: "Inscription à la newsletter Bestcrea",
          source: "newsletter",
          locale,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="newsletter-email">
        {t("emailPlaceholder")}
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(event) => {
          setStatus("idle");
          setEmail(event.target.value);
        }}
        placeholder={t("emailPlaceholder")}
        className="h-12 flex-1 rounded-full border border-primary/10 bg-white px-5 text-sm text-primary outline-none ring-[#7A35FF] placeholder:text-primary/40 focus:border-[#7A35FF] focus:ring-1"
        required
      />
      <Button
        type="submit"
        variant="accent"
        disabled={status === "loading"}
        className={cn("h-12 rounded-full px-6", status === "done" && "opacity-90")}
      >
        {status === "done" ? t("subscribed") : status === "loading" ? t("loading") : t("subscribe")}
      </Button>
      {status === "error" ? (
        <p className="text-sm text-red-500 sm:absolute sm:mt-14">{t("error")}</p>
      ) : null}
    </form>
  );
}
