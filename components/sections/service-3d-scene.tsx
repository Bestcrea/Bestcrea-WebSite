"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import {
  BarChart3,
  Bot,
  Cloud,
  Code2,
  Globe,
  MapPin,
  Palette,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

type Theme = { icon: LucideIcon; a: string; b: string };

/** Each service gets its own icon + color pair, all within the violet brand family. */
const THEMES: Record<string, Theme> = {
  "web-development": { icon: Code2, a: "#7A35FF", b: "#38BDF8" },
  "mobile-apps": { icon: Smartphone, a: "#8B5CF6", b: "#F472B6" },
  saas: { icon: Cloud, a: "#6D28D9", b: "#22D3EE" },
  wordpress: { icon: Globe, a: "#7A35FF", b: "#60A5FA" },
  migration: { icon: RefreshCw, a: "#9333EA", b: "#34D399" },
  "ai-automation": { icon: Bot, a: "#A855F7", b: "#FACC15" },
  "ui-ux": { icon: Palette, a: "#C026D3", b: "#FB923C" },
  seo: { icon: Search, a: "#7A35FF", b: "#4ADE80" },
  "hosting-domain": { icon: Server, a: "#6366F1", b: "#38BDF8" },
  "data-analytics": { icon: BarChart3, a: "#8B5CF6", b: "#2DD4BF" },
  cybersecurity: { icon: ShieldCheck, a: "#7C3AED", b: "#F87171" },
  geolocation: { icon: MapPin, a: "#9333EA", b: "#FBBF24" },
};
const FALLBACK: Theme = { icon: Code2, a: "#7A35FF", b: "#38BDF8" };

const FACES = [
  "rotateY(0deg)",
  "rotateY(90deg)",
  "rotateY(180deg)",
  "rotateY(-90deg)",
  "rotateX(90deg)",
  "rotateX(-90deg)",
];

/** 3D animated scene: spinning glass cube with the service icon, floating plates, orbit ring, pointer parallax. */
export function Service3DScene({ slug }: { slug: string }) {
  const theme = THEMES[slug] ?? FALLBACK;
  const Icon = theme.icon;
  const rootRef = useRef<HTMLDivElement>(null);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${x * 26}deg`);
    el.style.setProperty("--rx", `${-y * 22}deg`);
  }
  function onLeave() {
    rootRef.current?.style.setProperty("--ry", "0deg");
    rootRef.current?.style.setProperty("--rx", "0deg");
  }

  const size = 64; // cube edge in px
  const half = size / 2;

  return (
    <div
      ref={rootRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden
      className="svc3d-anim absolute inset-0 overflow-hidden"
      style={
        {
          "--a": theme.a,
          "--b": theme.b,
          perspective: "620px",
          background: `radial-gradient(120% 90% at 50% 105%, ${theme.a}55 0%, transparent 60%), linear-gradient(160deg, #1b1030 0%, #0d0818 100%)`,
        } as CSSProperties
      }
    >
      {/* ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${theme.b}66, transparent 70%)`, animation: "svc3d-pulse 4s ease-in-out infinite" }}
      />

      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transformStyle: "preserve-3d", transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
      >
        {/* perspective grid floor */}
        <div
          className="absolute inset-x-[-20%] bottom-[-8%] h-[55%] opacity-60"
          style={{
            transform: "rotateX(68deg) translateZ(-30px)",
            backgroundImage: `linear-gradient(${theme.a}66 1px, transparent 1px), linear-gradient(90deg, ${theme.a}66 1px, transparent 1px)`,
            backgroundSize: "26px 26px",
            maskImage: "linear-gradient(to top, black 30%, transparent)",
            WebkitMaskImage: "linear-gradient(to top, black 30%, transparent)",
          }}
        />

        {/* glass plates at different depths */}
        <div
          className="absolute left-[12%] top-[16%] h-14 w-20 rounded-xl border border-white/20 bg-white/[0.07] backdrop-blur-[2px]"
          style={{ transform: "translateZ(-40px) rotateZ(-8deg)", animation: "svc3d-float 6s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[14%] right-[10%] h-16 w-24 rounded-xl border border-white/25 bg-white/[0.09] backdrop-blur-[2px]"
          style={{ transform: "translateZ(50px) rotateZ(7deg)", animation: "svc3d-float 5s ease-in-out -2s infinite" }}
        >
          <div className="m-2.5 h-1.5 w-10 rounded-full" style={{ background: theme.b }} />
          <div className="mx-2.5 h-1.5 w-14 rounded-full bg-white/30" />
          <div className="m-2.5 h-1.5 w-8 rounded-full bg-white/20" />
        </div>

        {/* orbit ring */}
        <div
          className="absolute left-1/2 top-1/2 h-40 w-40 -ml-20 -mt-20 rounded-full border border-dashed"
          style={{
            borderColor: `${theme.b}88`,
            transform: "rotateX(72deg)",
            transformStyle: "preserve-3d",
            animation: "svc3d-orbit 12s linear infinite",
          }}
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full" style={{ background: theme.b, boxShadow: `0 0 12px ${theme.b}` }} />
          <span className="absolute -bottom-1 left-1/4 h-2 w-2 rounded-full bg-white/80" />
        </div>

        {/* spinning glass cube */}
        <div className="absolute left-1/2 top-1/2 -ml-8 -mt-8" style={{ width: size, height: size, transformStyle: "preserve-3d", animation: "svc3d-float 5s ease-in-out infinite" }}>
          <div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d", animation: "svc3d-spin 14s linear infinite" }}
          >
            {FACES.map((t, i) => (
              <div
                key={t}
                className="absolute inset-0 grid place-items-center rounded-lg border border-white/35"
                style={{
                  transform: `${t} translateZ(${half}px)`,
                  background: `linear-gradient(135deg, ${theme.a}cc, ${theme.b}99)`,
                  boxShadow: `inset 0 0 18px rgba(255,255,255,0.25)`,
                  backfaceVisibility: "hidden",
                }}
              >
                {i < 4 ? <Icon className="h-7 w-7 text-white drop-shadow" strokeWidth={1.8} /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* top sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
    </div>
  );
}
