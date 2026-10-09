import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

type Props = { params: Promise<{ locale: string }> };

export default async function AdminLoginPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#292D32] px-4">
      <Suspense fallback={<div className="text-white/70">…</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
