"use client";

import { FormEvent, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Building2, Check, FileText, Hash, Lock, Mail, MapPin, Phone, ShieldCheck, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEGAL_STATUSES, LEGAL_STATUS_LABELS } from "@/lib/validators";
import { AuthLabel, IconInput, PasswordInput, PlainSelect, Switch } from "@/components/client/auth-fields";

type Props = {
  /** Where to send the user after sign-up (defaults to the client portal). */
  callbackUrl?: string;
  /** Embedded mode (checkout): single page, no heading, no stepper. */
  embedded?: boolean;
  /** Called instead of redirecting when provided (e.g. checkout continues in place). */
  onRegistered?: () => void;
};

type Dial = { code: string; label: string };

const DIAL_GROUPS: { group: string; items: Dial[] }[] = [
  {
    group: "Maghreb",
    items: [
      { code: "+212", label: "🇲🇦 +212 · Maroc" },
      { code: "+213", label: "🇩🇿 +213 · Algérie" },
      { code: "+216", label: "🇹🇳 +216 · Tunisie" },
      { code: "+222", label: "🇲🇷 +222 · Mauritanie" },
    ],
  },
  {
    group: "Europe",
    items: [
      { code: "+33", label: "🇫🇷 +33 · France" },
      { code: "+34", label: "🇪🇸 +34 · Espagne" },
      { code: "+49", label: "🇩🇪 +49 · Allemagne" },
      { code: "+39", label: "🇮🇹 +39 · Italie" },
      { code: "+32", label: "🇧🇪 +32 · Belgique" },
      { code: "+31", label: "🇳🇱 +31 · Pays-Bas" },
      { code: "+351", label: "🇵🇹 +351 · Portugal" },
      { code: "+44", label: "🇬🇧 +44 · Royaume-Uni" },
      { code: "+41", label: "🇨🇭 +41 · Suisse" },
      { code: "+43", label: "🇦🇹 +43 · Autriche" },
      { code: "+352", label: "🇱🇺 +352 · Luxembourg" },
      { code: "+353", label: "🇮🇪 +353 · Irlande" },
      { code: "+46", label: "🇸🇪 +46 · Suède" },
      { code: "+47", label: "🇳🇴 +47 · Norvège" },
      { code: "+45", label: "🇩🇰 +45 · Danemark" },
      { code: "+358", label: "🇫🇮 +358 · Finlande" },
      { code: "+48", label: "🇵🇱 +48 · Pologne" },
      { code: "+40", label: "🇷🇴 +40 · Roumanie" },
      { code: "+30", label: "🇬🇷 +30 · Grèce" },
      { code: "+90", label: "🇹🇷 +90 · Turquie" },
    ],
  },
  {
    group: "Pays du Golfe",
    items: [
      { code: "+966", label: "🇸🇦 +966 · Arabie saoudite" },
      { code: "+971", label: "🇦🇪 +971 · Émirats arabes unis" },
      { code: "+974", label: "🇶🇦 +974 · Qatar" },
      { code: "+965", label: "🇰🇼 +965 · Koweït" },
      { code: "+973", label: "🇧🇭 +973 · Bahreïn" },
      { code: "+968", label: "🇴🇲 +968 · Oman" },
    ],
  },
  {
    group: "Autres",
    items: [
      { code: "+20", label: "🇪🇬 +20 · Égypte" },
      { code: "+1", label: "🇺🇸 +1 · États-Unis / Canada" },
    ],
  },
];

export function RegisterForm({ callbackUrl, embedded = false, onRegistered }: Props) {
  const t = useTranslations("ClientPortal.auth");
  const locale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [isCompany, setIsCompany] = useState(false);

  const target = callbackUrl ?? `/${locale}/espace-client`;
  const steps = [t("stepAccount"), t("stepContact"), t("stepProfile")];
  const last = steps.length - 1;
  const stepped = !embedded;

  // Show a step's section when it is the current step (or always in embedded/single-page mode).
  const show = (n: number) => (stepped ? step === n : true);

  /** Validate only the fields of the current step using native constraint validation. */
  function validateStep(n: number) {
    const form = formRef.current;
    if (!form) return false;
    const section = form.querySelector<HTMLElement>(`[data-step="${n}"]`);
    const fields = section?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select") ?? [];
    for (const field of Array.from(fields)) {
      if (!field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    if (n === 0) {
      const data = new FormData(form);
      if (String(data.get("password") || "") !== String(data.get("confirm") || "")) {
        setError(t("passwordMismatch"));
        return false;
      }
    }
    setError(null);
    return true;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(last, s + 1));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stepped && step < last) return next();
    setError(null);
    const data = new FormData(event.currentTarget);

    const password = String(data.get("password") || "");
    if (password !== String(data.get("confirm") || "")) {
      setStep(0);
      return setError(t("passwordMismatch"));
    }
    if (!accepted) return setError(t("termsRequired"));

    setLoading(true);
    const dial = String(data.get("dial") || "+212");
    const local = String(data.get("phone") || "").replace(/[\s.-]/g, "").replace(/^0+/, "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          password,
          phone: local ? `${dial}${local}` : undefined,
          address: data.get("address") || undefined,
          city: data.get("city") || undefined,
          company: isCompany ? data.get("company") || undefined : undefined,
          ice: isCompany ? data.get("ice") || undefined : undefined,
          rc: isCompany ? data.get("rc") || undefined : undefined,
          legalStatus: data.get("legalStatus") || undefined,
          locale,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || t("registerError"));
      }

      const result = await signIn("credentials", {
        email: String(data.get("email") || ""),
        password,
        redirect: false,
        callbackUrl: target,
      });
      if (result?.error) throw new Error(t("loginError"));

      if (onRegistered) {
        onRegistered();
        return;
      }
      window.location.href = result?.url || target;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("registerError"));
      setLoading(false);
    }
  }

  const hidden = (n: number) => (show(n) ? "space-y-4" : "hidden");

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate={false} className="w-full space-y-5">
      {embedded ? null : (
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-primary">{t("registerTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("panelRegisterText")}</p>
        </div>
      )}

      {stepped ? (
        <nav aria-label={t("stepOf", { current: step + 1, total: steps.length })} className="flex items-center justify-center gap-2">
          {steps.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      active || done ? "bg-accent text-white" : "bg-primary/10 text-primary/50"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={cn("hidden text-sm sm:inline", active ? "font-semibold text-primary" : "text-primary/50")}>{label}</span>
                </div>
                {i < steps.length - 1 ? <span className={cn("h-px w-6 sm:w-8", done ? "bg-accent" : "bg-primary/15")} /> : null}
              </div>
            );
          })}
        </nav>
      ) : null}

      {/* Step 1 — account */}
      <div data-step="0" className={hidden(0)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <AuthLabel>{t("firstName")}</AuthLabel>
            <IconInput icon={<User />} name="firstName" required autoComplete="given-name" placeholder="Adam" />
          </label>
          <label className="block">
            <AuthLabel>{t("lastName")}</AuthLabel>
            <IconInput icon={<User />} name="lastName" required autoComplete="family-name" placeholder="Smith" />
          </label>
        </div>
        <label className="block">
          <AuthLabel>{t("email")}</AuthLabel>
          <IconInput icon={<Mail />} name="email" type="email" required autoComplete="email" placeholder="votre@example.com" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <AuthLabel>{t("password")}</AuthLabel>
            <PasswordInput icon={<Lock />} showLabel={t("showPassword")} name="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
          </label>
          <label className="block">
            <AuthLabel>{t("confirmPassword")}</AuthLabel>
            <PasswordInput icon={<ShieldCheck />} showLabel={t("showPassword")} name="confirm" required minLength={8} autoComplete="new-password" placeholder="••••••••" />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
      </div>

      {/* Step 2 — contact */}
      <div data-step="1" className={hidden(1)}>
        <div>
          <AuthLabel>{t("phone")}</AuthLabel>
          <div className="grid grid-cols-[150px_1fr] gap-2">
            <PlainSelect name="dial" defaultValue="+212" aria-label="Indicatif">
              {DIAL_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map((d) => (
                    <option key={d.code + d.label} value={d.code}>
                      {d.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </PlainSelect>
            <IconInput icon={<Phone />} name="phone" type="tel" required autoComplete="tel-national" placeholder="612345678" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("phoneHint")}</p>
        </div>
        <label className="block">
          <AuthLabel>{t("address")}</AuthLabel>
          <IconInput icon={<MapPin />} name="address" required autoComplete="street-address" />
        </label>
        <label className="block">
          <AuthLabel>{t("city")}</AuthLabel>
          <IconInput icon={<MapPin />} name="city" required autoComplete="address-level2" />
        </label>
      </div>

      {/* Step 3 — profile */}
      <div data-step="2" className={hidden(2)}>
        <label className="block">
          <AuthLabel>{t("legalStatus")}</AuthLabel>
          <PlainSelect name="legalStatus" required defaultValue="">
            <option value="" disabled>
              {t("legalStatusPlaceholder")}
            </option>
            {LEGAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEGAL_STATUS_LABELS[status]}
              </option>
            ))}
          </PlainSelect>
        </label>

        <Switch checked={isCompany} onChange={setIsCompany}>
          {t("isCompany")}
        </Switch>
        {isCompany ? (
          <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/[0.03] p-4">
            <label className="block">
              <AuthLabel>{t("company")}</AuthLabel>
              <IconInput icon={<Building2 />} name="company" required autoComplete="organization" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <AuthLabel>ICE</AuthLabel>
                <IconInput icon={<Hash />} name="ice" required inputMode="numeric" pattern="[0-9]{15}" maxLength={15} placeholder="15 chiffres" />
              </label>
              <label className="block">
                <AuthLabel>RC ({t("optional")})</AuthLabel>
                <IconInput icon={<FileText />} name="rc" />
              </label>
            </div>
          </div>
        ) : null}

        <Switch checked={accepted} onChange={setAccepted}>
          {t("acceptPrefix")}{" "}
          <Link href="/ressources/politique-confidentialite" target="_blank" className="font-semibold text-accent hover:underline">
            {t("privacy")}
          </Link>
        </Switch>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        {stepped && step > 0 ? (
          <Button type="button" variant="outline" className="h-11" onClick={() => { setError(null); setStep((s) => s - 1); }}>
            <ArrowLeft className="me-1 h-4 w-4" /> {t("back")}
          </Button>
        ) : null}
        {stepped && step < last ? (
          <Button type="button" variant="accent" className="h-11 flex-1 text-base" onClick={next}>
            {t("next")} <ArrowRight className="ms-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" variant="accent" className="h-11 flex-1 text-base" disabled={loading}>
            {loading ? t("registering") : t("register")} {loading ? null : <ArrowRight className="ms-1 h-4 w-4" />}
          </Button>
        )}
      </div>

      {embedded ? null : (
        <p className="text-center text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <Link href="/espace-client/login" className="font-semibold text-accent hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      )}
    </form>
  );
}
