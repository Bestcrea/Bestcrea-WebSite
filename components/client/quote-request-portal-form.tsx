"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ServiceOption = { id: string; title: string };

const BUDGETS = ["< 3 000 DH", "3 000 – 6 000 DH", "6 000 – 10 000 DH", "> 10 000 DH"];
const cls = "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#7A35FF] focus:ring-2 focus:ring-[#7A35FF]/20";
const h = "h-10";
const lbl = "block text-sm font-medium text-neutral-800";

export function PortalQuoteRequestForm({ services }: { services: ServiceOption[] }) {
  const t = useTranslations("QuoteForm");
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [number, setNumber] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    setError("");
    const raw = Object.fromEntries(new FormData(form).entries());
    const payload = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""));
    const response = await fetch("/api/client/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await response.json().catch(() => null)) as { error?: string; request?: { number: string } } | null;
    if (!response.ok) {
      setState("idle");
      return setError(data?.error || t("error"));
    }
    setNumber(data?.request?.number ?? "");
    setState("done");
    form.reset();
    router.refresh();
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold text-emerald-800"><CheckCircle2 className="h-5 w-5" /> {t("sentTitle", { number })}</p>
        <p className="mt-1 text-emerald-700">{t("sentText")}</p>
        <Button className="mt-3" variant="outline" size="sm" onClick={() => setState("idle")}>{t("again")}</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:grid-cols-2">
      <label className={lbl + " sm:col-span-2"}>
        {t("title")} <span className="text-red-500" aria-label={t("required")}>*</span>
        <input name="title" required maxLength={200} className={`${cls} ${h}`} placeholder={t("titlePh")} />
      </label>
      <label className={lbl}>
        {t("service")}
        <select name="serviceId" className={`${cls} ${h}`} defaultValue="">
          <option value="">{t("unspecified")}</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </label>
      <label className={lbl}>
        {t("budget")}
        <select name="budget" className={`${cls} ${h}`} defaultValue="">
          <option value="">{t("choose")}</option>
          {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </label>
      <label className={lbl + " sm:col-span-2"}>
        {t("description")} <span className="text-red-500" aria-label={t("required")}>*</span>
        <textarea name="description" required rows={4} maxLength={5000} className={`${cls} py-2`} />
      </label>
      <label className={lbl}>
        {t("quantity")}
        <input name="quantity" type="number" min="1" className={`${cls} ${h}`} />
      </label>
      <label className={lbl}>
        {t("deadline")}
        <input name="desiredDeadline" type="date" className={`${cls} ${h}`} />
      </label>
      <label className={lbl + " sm:col-span-2"}>
        {t("requirements")}
        <textarea name="requirements" rows={2} maxLength={5000} className={`${cls} py-2`} />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" variant="accent" disabled={state === "sending"}>
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {state === "sending" ? t("sending") : t("send")}
        </Button>
        {error ? <span role="alert" className="text-sm text-red-600">{error}</span> : null}
      </div>
    </form>
  );
}
