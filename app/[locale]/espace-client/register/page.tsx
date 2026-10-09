import { getTranslations, setRequestLocale } from "next-intl/server";
import { RegisterForm } from "@/components/client/register-form";
import { AuthShell } from "@/components/client/auth-shell";

type Props = { params: Promise<{ locale: string }> };

export default async function ClientRegisterPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("ClientPortal.auth");

  return (
    <div className="py-4">
      <AuthShell title={t("panelRegisterTitle")} text={t("panelRegisterText")}>
        <RegisterForm />
      </AuthShell>
    </div>
  );
}
