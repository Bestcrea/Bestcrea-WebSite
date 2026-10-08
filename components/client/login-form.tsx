"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AuthLabel, IconInput, PasswordInput } from "@/components/client/auth-fields";

export function LoginForm({ embedded = false, callbackUrl: callbackProp }: { embedded?: boolean; callbackUrl?: string }) {
  const t = useTranslations("ClientPortal.auth");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = callbackProp || searchParams.get("callbackUrl") || `/${locale}/espace-client`;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const data = new FormData(event.currentTarget);

    const result = await signIn("credentials", {
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    if (result?.error) {
      setError(t("loginError"));
      return;
    }
    window.location.href = result?.url || callbackUrl;
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-5">
      {embedded ? null : (
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-primary">{t("loginTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("loginDescription")}</p>
        </div>
      )}

      <label className="block">
        <AuthLabel>{t("email")}</AuthLabel>
        <IconInput icon={<Mail />} name="email" type="email" required autoComplete="email" placeholder="votre@example.com" />
      </label>

      <label className="block">
        <AuthLabel>{t("password")}</AuthLabel>
        <PasswordInput
          icon={<Lock />}
          showLabel={t("showPassword")}
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </label>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="accent" className="h-11 w-full text-base" disabled={loading}>
        {loading ? t("signingIn") : t("signIn")} {loading ? null : <ArrowRight className="ms-1 h-4 w-4" />}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/espace-client/register" className="font-semibold text-accent hover:underline">
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}
