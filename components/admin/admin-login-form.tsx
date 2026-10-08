"use client";

import { FormEvent, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminLoginForm() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}/admin`;
  const forbidden = searchParams.get("error") === "forbidden";

  const [error, setError] = useState<string | null>(
    forbidden ? "Accès réservé aux rôles admin et editor." : null
  );
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

    if (result?.error) {
      setLoading(false);
      setError("Identifiants invalides.");
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;
    if (!role || role === "client") {
      setLoading(false);
      setError("Accès réservé au personnel Bestcrea.");
      await signOut({ redirect: false });
      return;
    }

    window.location.href = result?.url || callbackUrl;
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-white text-[#292D32]">
      <CardHeader>
        <CardTitle>Administration Bestcrea</CardTitle>
        <CardDescription>Connexion personnel Bestcrea</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
