import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/client/login-form";
import { AuthShell } from "@/components/client/auth-shell";

type Props = { params: { locale: string } };

export default async function ClientLoginPage({ params }: Props) {
  setRequestLocale(params.locale);
  const t = await getTranslations("ClientPortal.auth");

  return (
    <div className="py-4">
      <AuthShell title={t("panelLoginTitle")} text={t("panelLoginText")}>
        <Suspense fallback={<div className="text-sm text-muted-foreground">…</div>}>
          <LoginForm />
        </Suspense>
      </AuthShell>
    </div>
  );
}
