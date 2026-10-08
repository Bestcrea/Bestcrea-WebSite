"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function AnimatedDomainPlaceholder({ texts }: { texts: [string, string] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % 2),
      2500
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="relative block h-5 w-full overflow-hidden sm:h-6">
      {texts.map((text, itemIndex) => (
        <span
          key={text}
          className={cn(
            "absolute inset-0 truncate text-sm text-[#292D32]/45 transition-opacity duration-700 sm:text-base",
            itemIndex === index ? "opacity-100" : "opacity-0"
          )}
        >
          {text}
        </span>
      ))}
    </span>
  );
}

function HeroDomainSearch() {
  const t = useTranslations("HomePage.hero");
  const tNav = useTranslations("Navigation");
  const router = useRouter();
  const [domain, setDomain] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = domain.trim();
    if (!q) return;
    router.push(`/domaine?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 w-full basis-full lg:w-auto lg:min-w-[20rem] lg:flex-1 lg:basis-0">
      <label htmlFor="hero-domain-input" className="sr-only">
        {t("domainPlaceholder1")}
      </label>
      <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-lg shadow-black/20 sm:gap-3 sm:p-1.5">
        <Search
          className="ms-3 h-4 w-4 shrink-0 text-[#292D32]/40 sm:ms-4 sm:h-5 sm:w-5"
          aria-hidden
        />
        <div className="relative min-w-0 flex-1">
          {!domain.trim() ? (
            <div className="pointer-events-none absolute inset-0 flex items-center pe-2">
              <AnimatedDomainPlaceholder
                texts={[t("domainPlaceholder1"), t("domainPlaceholder2")]}
              />
            </div>
          ) : null}
          <input
            id="hero-domain-input"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            className="relative w-full bg-transparent py-2 text-sm text-[#292D32] outline-none sm:text-base"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={!domain.trim()}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#7A35FF] px-3.5 text-sm font-semibold text-[#FFFFFF] transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10 sm:px-5"
        >
          <span className="hidden sm:inline">{tNav("domainSearchCta")}</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180 sm:hidden" aria-hidden />
        </button>
      </div>
    </form>
  );
}

function HeroBadge({
  href,
  image,
  title,
  subtitle,
}: {
  href?: string;
  image: string;
  title: string;
  subtitle: string;
}) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1.5">
        <Image
          src={image}
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0 text-start leading-tight">
        <p className="text-[15px] font-bold text-white sm:text-base">{title}</p>
        <p className="text-xs text-white/60">{subtitle}</p>
      </div>
    </>
  );

  const className =
    "inline-flex max-w-full items-center gap-2.5 transition-opacity hover:opacity-90";

  if (href) {
    return (
      <a href={href} className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

function AffiliationBadges() {
  const t = useTranslations("HomePage.hero");

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-4 sm:gap-5 lg:gap-6">
      <HeroBadge
        href="#"
        image="/images/hostinger.jpeg"
        title={t("hostingerTitle")}
        subtitle={t("hostingerSubtitle")}
      />
      <HeroBadge
        href="#"
        image="/images/nindohost.svg"
        title={t("nindohostTitle")}
        subtitle={t("nindohostSubtitle")}
      />
      <HeroBadge
        image="/images/ma.png"
        title={t("maTitle")}
        subtitle={t("maSubtitle")}
      />
    </div>
  );
}

export function HeroBanner() {
  const t = useTranslations("HomePage.hero");

  const trustItems = [t("trustMigration"), t("trustGuarantee"), t("trustSupport")];

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#4C1AC7] via-[#7A35FF] to-[#9B6BFF] px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-24">
      <div
        className="pointer-events-none absolute -top-24 -end-24 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -start-16 h-[24rem] w-[24rem] rounded-full bg-[#4C1AC7]/40 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 48%, white 48%, white 50%, transparent 50%)",
          backgroundSize: "3rem 3rem",
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center text-center">
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {t("title")}
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
          {t("description")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-white text-[#292D32] hover:bg-white/90"
          >
            <Link href="/ressources/devis">
              {t("cta")}
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 hover:text-white"
          >
            <a
              href="https://wa.me/212636499140"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("whatsappCta")}
            </a>
          </Button>
        </div>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-white/75">
          <Check className="h-4 w-4 shrink-0 text-white" aria-hidden />
          {trustItems.map((item, index) => (
            <span key={item} className="inline-flex items-center gap-2">
              {index > 0 ? (
                <span className="text-white/35" aria-hidden>
                  ·
                </span>
              ) : null}
              <span>{item}</span>
            </span>
          ))}
        </p>

        <div className="mt-10 flex w-full max-w-6xl flex-wrap items-center justify-center gap-3 lg:flex-nowrap lg:justify-between lg:gap-4">
          <HeroDomainSearch />
          <AffiliationBadges />
        </div>
      </div>
    </section>
  );
}
