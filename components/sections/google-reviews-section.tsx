"use client";

import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star, ThumbsUp } from "lucide-react";
import {
  googleReviews,
  googleReviewsAverage,
  googleReviewsTotal,
} from "@/lib/google-reviews";

const avatarPalette = [
  "bg-[#7A35FF]",
  "bg-[#EA4335]",
  "bg-[#34A853]",
  "bg-[#4285F4]",
  "bg-[#FBBC05]",
  "bg-[#9C27B0]",
  "bg-[#FF6F00]",
  "bg-[#00897B]",
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-[#FBBC05] text-[#FBBC05]" : "fill-primary/10 text-primary/10"}`}
        />
      ))}
    </span>
  );
}

export function GoogleReviewsSection() {
  const t = useTranslations("Pages.resources.stories");

  return (
    <LazyMotion features={domAnimation} strict>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary">{t("reviewsTitle")}</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">{t("reviewsDescription")}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-3 shadow-sm">
            <span className="text-3xl font-bold text-primary">
              {googleReviewsAverage.toFixed(1)}
            </span>
            <div>
              <Stars rating={5} />
              <p className="mt-0.5 text-xs text-muted-foreground">
                {googleReviewsTotal} {t("reviewsLabel")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {googleReviews.map((review, i) => (
            <m.div
              key={review.author}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.06 }}
              className="flex flex-col rounded-2xl border border-primary/10 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${avatarPalette[i % avatarPalette.length]}`}
                >
                  {review.author.trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">{review.author}</p>
                  <p className="text-xs text-primary/40">
                    {review.reviewCount} {t("reviewCountLabel")}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Stars rating={review.rating} />
                <span className="text-xs text-primary/40">{review.timeAgo}</span>
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-primary/80">{review.text}</p>

              {review.translated ? (
                <p className="mt-2 text-[11px] italic text-primary/30">{t("translatedByGoogle")}</p>
              ) : null}

              <div className="mt-3 flex items-center gap-1 text-primary/30">
                <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              </div>
            </m.div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-primary/40">{t("reviewsSource")}</p>
      </section>
    </LazyMotion>
  );
}
