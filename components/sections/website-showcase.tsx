"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const VIDEO_SRC = "/videos/bestcrea-demo.mp4";
const POSTER_SRC = "/videos/bestcrea-demo-poster.svg";

export function WebsiteShowcase() {
  const t = useTranslations("HomePage.websiteShowcase");
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px", threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;

    const tryPlay = async () => {
      try {
        video.muted = true;
        await video.play();
        if (!cancelled) setPlaying(true);
      } catch {
        if (!cancelled) setPlaying(false);
      }
    };

    if (video.readyState >= 2) {
      void tryPlay();
    } else {
      const onCanPlay = () => {
        setReady(true);
        void tryPlay();
      };
      video.addEventListener("canplay", onCanPlay, { once: true });
      return () => {
        cancelled = true;
        video.removeEventListener("canplay", onCanPlay);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [shouldLoad]);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="bg-background px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
      aria-labelledby="website-showcase-title"
    >
      <div className="mx-auto max-w-6xl">
        <h2
          id="website-showcase-title"
          className="text-center text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl"
        >
          {t("title")}
        </h2>

        <div
          className={cn(
            "mt-10 rounded-[20px] p-4 shadow-2xl shadow-primary/15 sm:mt-12 sm:p-6 md:p-8",
            "bg-gradient-to-br from-[#292D32] via-[#5a2a6b] to-[#2a1233]",
            "ring-1 ring-white/10 transition-[box-shadow,ring-color] duration-300",
            "hover:ring-[#7A35FF]/40 hover:shadow-[0_20px_60px_rgba(122,53,255,0.12)]"
          )}
        >
          {/* Fake browser chrome */}
          <div className="overflow-hidden rounded-2xl bg-[#1a0f21] ring-1 ring-white/10">
            <div className="flex items-center gap-3 border-b border-white/10 bg-[#24132e] px-3 py-2.5 sm:px-4">
              <div className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="min-w-0 flex-1 rounded-full bg-white/5 px-3 py-1 text-center text-[11px] text-white/55 sm:text-xs">
                {t("urlBar")}
              </div>
            </div>

            <div className="relative aspect-video bg-[#120814]">
              {!ready && shouldLoad ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={POSTER_SRC}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  aria-hidden
                />
              ) : null}
              {!shouldLoad ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={POSTER_SRC}
                  alt={t("posterAlt")}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  poster={POSTER_SRC}
                  muted
                  loop
                  playsInline
                  preload="none"
                  onLoadedData={() => setReady(true)}
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  aria-label={t("videoLabel")}
                >
                  <source src={VIDEO_SRC} type="video/mp4" />
                </video>
              )}

              {shouldLoad ? (
                <button
                  type="button"
                  onClick={() => void togglePlayback()}
                  className="absolute bottom-3 end-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm ring-1 ring-white/20 transition-colors hover:bg-black/70"
                  aria-label={playing ? t("pause") : t("play")}
                >
                  {playing ? (
                    <Pause className="h-4 w-4" aria-hidden />
                  ) : (
                    <Play className="ms-0.5 h-4 w-4" aria-hidden />
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
