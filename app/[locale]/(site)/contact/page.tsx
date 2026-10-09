import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/sections/contact-form";
import { ContactHelp } from "@/components/sections/contact-help";
import { ContactInfoTabs } from "@/components/sections/contact-info-tabs";
import { buildPageMetadata } from "@/lib/page-metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const t = await getTranslations({ locale: params.locale, namespace: "Pages.contact" });
  return buildPageMetadata({
    locale: params.locale,
    path: "contact",
    pageKey: "contact",
    title: t("title"),
    description: t("description"),
  });
}

const MAP_EMBED =
  "https://maps.google.com/maps?q=305%20Rue%20Mohamed%20Zerktouni%2C%20Khemisset%2C%20Morocco&t=&z=15&ie=UTF8&iwloc=&output=embed";

export default async function ContactPage(props: Props) {
  const params = await props.params;
  setRequestLocale(params.locale);
  const t = await getTranslations("Pages.contact");

  return (
    <>
      <PageHero
        eyebrow={t("homeLabel")}
        title={t("title")}
        description={t("description")}
      >
        <div className="mt-8">
          <a
            href="https://wa.me/212636499140"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[#7A35FF] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("heroCta")}
          </a>
        </div>
      </PageHero>

      <ContactHelp />

      <ContactInfoTabs />

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-[#292D32] md:text-3xl">
            {t("formSectionTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[#292D32]/70">
            {t("formSectionSubtitle")}
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="bg-[#F0F2F5] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-[#292D32] md:text-3xl">
            {t("mapSectionTitle")}
          </h2>
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#292D32]/10 shadow-sm">
            <iframe
              title={t("mapTitle")}
              src={MAP_EMBED}
              className="h-96 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </>
  );
}
