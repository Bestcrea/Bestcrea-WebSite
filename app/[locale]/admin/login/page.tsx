import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

type Props = { params: { locale: string } };

export default function AdminLoginPage({ params }: Props) {
  setRequestLocale(params.locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#292D32] px-4">
      <Suspense fallback={<div className="text-white/70">…</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
