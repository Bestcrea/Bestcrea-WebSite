"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { BadgeCheck, Mail, MapPin, Phone } from "lucide-react";
import {
  SiVisa,
  SiMastercard,
  SiPaypal,
  SiWesternunion,
  SiFacebook,
  SiInstagram,
  SiGithub,
  SiReddit,
  SiTelegram,
  SiWhatsapp,
  SiX,
} from "react-icons/si";

function LinkedinGlyph(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={props.className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.56V9h3.554v11.452z" />
    </svg>
  );
}
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";
import { resourceItems, serviceCategories } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const socials = [
  { key: "facebook", href: "https://www.facebook.com/share/1EmLBCXzdQ/?mibextid=wwXIfr", Icon: SiFacebook },
  { key: "instagram", href: "https://www.instagram.com/thebestcrea", Icon: SiInstagram },
  { key: "github", href: "https://github.com/Bestcrea", Icon: SiGithub },
  { key: "reddit", href: "https://www.reddit.com/user/bestcrea", Icon: SiReddit },
  { key: "telegram", href: "https://t.me/bestcreaagency", Icon: SiTelegram },
  { key: "whatsapp", href: "https://wa.me/message/AHNK3DLMPNHQO1", Icon: SiWhatsapp },
  {
    key: "linkedin",
    href: "https://www.linkedin.com/in/marouanbahtit?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    Icon: LinkedinGlyph,
  },
  { key: "twitter", href: "https://x.com/marouanb18902?s=11", Icon: SiX },
];

const paymentMethods = [
  { key: "visa", label: "Visa", Icon: SiVisa, fg: "text-[#1A1F71]" },
  { key: "mastercard", label: "Mastercard", Icon: SiMastercard, fg: "text-[#EB001B]" },
  { key: "paypal", label: "PayPal", Icon: SiPaypal, fg: "text-[#003087]" },
  { key: "westernUnion", label: "Western Union", Icon: SiWesternunion, fg: "text-[#FFDD00]" },
];

const footerLinkClass =
  "group inline-flex items-center text-sm text-[#292D32]/70 transition-colors hover:text-accent";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navigation");

  return (
    <footer className="bg-[#F0F2F5] text-[#292D32]">

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#292D32]/70">
              {t("description")}
            </p>
            <div className="mt-6 space-y-3 text-sm text-[#292D32]/75">
              <a
                href={`tel:${t("phone").replace(/\s/g, "")}`}
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4 text-accent" />
                {t("phone")}
              </a>
              <a
                href={`mailto:${t("email")}`}
                className="flex items-center gap-2 transition-colors hover:text-accent"
              >
                <Mail className="h-4 w-4 text-accent" />
                {t("email")}
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                {t("address")}
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-accent" />
                {t("iceLabel")}: {t("iceNumber")}
              </p>
              <p className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-accent" />
                {t("ifLabel")}: {t("ifNumber")}
              </p>
            </div>
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t("social")}
              </p>
              <div className="flex gap-2">
                {socials.map(({ key, href, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-black/5 text-[#292D32] transition-transform hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-foreground"
                    aria-label={key}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t("quickLinks")}
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className={footerLinkClass}>
                    <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link href="/agence" className={footerLinkClass}>
                    <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                    {t("agency")}
                  </Link>
                </li>
                <li>
                  <Link href="/tarifs" className={footerLinkClass}>
                    <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                    {tNav("tarifs")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={footerLinkClass}>
                    <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                    {t("contactLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/espace-client" className={footerLinkClass}>
                    <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                    {t("clientSpace")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t("services")}
              </h3>
              <ul className="space-y-2.5">
                {serviceCategories.slice(0, 6).map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className={footerLinkClass}>
                      <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {t("resources")}
              </h3>
              <ul className="space-y-2.5">
                {resourceItems.map((item) => (
                  <li key={item.key}>
                    <Link href={item.href} className={footerLinkClass}>
                      <span className="me-2 h-px w-0 bg-accent transition-all group-hover:w-3" />
                      {tNav(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-black/10 pt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {t("paymentMethods")}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {paymentMethods.map(({ key, label, Icon, fg }) => (
              <span
                key={key}
                className="grid h-10 w-14 shrink-0 place-items-center rounded-lg border border-black/10 bg-white shadow-sm"
                title={label}
              >
                <Icon className={cn("h-5 w-5", fg)} aria-label={label} />
              </span>
            ))}
            <span
              className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm"
              title="Ria"
            >
              <Image
                src="/images/payment-methods/ria.png"
                alt="Ria"
                fill
                sizes="56px"
                className="object-contain p-1.5"
              />
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-black/10 pt-6 text-xs text-[#292D32]/60 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Bestcrea. {t("rights")}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/ressources/politique-confidentialite"
              className="text-[#292D32]/60 transition-colors hover:text-accent"
            >
              {t("privacyPolicy")}
            </Link>
            <p className="text-[#292D32]/40">
              {t("legalIds")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
