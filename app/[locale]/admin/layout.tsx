import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { requireAdminSession } from "@/lib/admin-auth";
import { getRolePermissions } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function AdminLayout({ children, params }: Props) {
  setRequestLocale(params.locale);
  const session = await requireAdminSession();
  const permissions = session ? await getRolePermissions(session.user.role) : [];

  return (
    <AuthSessionProvider>
      {session ? (
        <div className="flex min-h-screen bg-[#F0F2F5] text-[#292D32]">
          <AdminSidebar
            userName={session.user.name}
            role={session.user.role}
            permissions={permissions}
          />
          <main className="min-w-0 flex-1 overflow-y-auto pt-14 lg:pt-0">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen bg-[#292D32]">{children}</div>
      )}
    </AuthSessionProvider>
  );
}
