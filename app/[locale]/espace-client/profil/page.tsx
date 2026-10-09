import { User } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PortalBanner } from "@/components/client/portal-banner";
import { ProfileForm } from "@/components/client/profile-form";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/session";

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("ClientPortal.nav");
  const session = await requireClientSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PortalBanner icon={User} title={t("myProfile")} />
      <ProfileForm
        initial={{
          name: user.name ?? "",
          email: user.email,
          phone: user.phone ?? "",
          company: user.company ?? "",
          ice: user.ice ?? "",
          rc: user.rc ?? "",
          address: user.address ?? "",
          city: user.city ?? "",
          clientCode: user.clientCode ?? "",
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
