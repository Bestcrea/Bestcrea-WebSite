"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type GsapLike = typeof import("gsap").default;

const ORBS = [
  { id: "orb-0", radius: 42, size: 14, duration: 14, accent: true, startAngle: -40 },
  { id: "orb-1", radius: 34, size: 11, duration: 19, accent: true, startAngle: 120 },
  { id: "orb-2", radius: 28, size: 8, duration: 24, accent: false, startAngle: 210 },
] as const;

/**
 * Heavy GSAP presentation — loaded only when LazySection brings it into view.
 * GSAP is dynamically imported inside the effect to keep it out of the initial bundle.
 */
export default function PresentationAnimation() {
  const t = useTranslations("HomePage.presentation");
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const activeRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const visual = visualRef.current;
    const line = lineRef.current;
    if (!section || !visual || !line) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    let tickerFn: ((time: number, delta: number, frame: number) => void) | null =
      null;
    let gsapRef: GsapLike | null = null;

    void (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;

      const hub = visual.querySelector<HTMLElement>("[data-hub]");
      const steps = Array.from(
        section.querySelectorAll<HTMLElement>("[data-step]")
      );
      const orbitEls = Array.from(
        visual.querySelectorAll<HTMLElement>("[data-orbit]")
      );
      const orbEls = Array.from(
        visual.querySelectorAll<HTMLElement>("[data-orb]")
      );

      const setLineLength = () => {
        const x1 = Number(line.getAttribute("x1") ?? 0);
        const y1 = Number(line.getAttribute("y1") ?? 0);
        const x2 = Number(line.getAttribute("x2") ?? 0);
        const y2 = Number(line.getAttribute("y2") ?? 0);
        return Math.hypot(x2 - x1, y2 - y1) || 1;
      };

      const updateLineToOrb = (index: number) => {
        if (!hub) return;
        const orb = orbEls[index];
        if (!orb) return;
        const vRect = visual.getBoundingClientRect();
        const hRect = hub.getBoundingClientRect();
        const oRect = orb.getBoundingClientRect();
        const x1 = hRect.left + hRect.width / 2 - vRect.left;
        const y1 = hRect.top + hRect.height / 2 - vRect.top;
        const x2 = oRect.left + oRect.width / 2 - vRect.left;
        const y2 = oRect.top + oRect.height / 2 - vRect.top;
        line.setAttribute("x1", String(x1));
        line.setAttribute("y1", String(y1));
        line.setAttribute("x2", String(x2));
        line.setAttribute("y2", String(y2));
      };

      const setOrbStates = (active: number | null) => {
        orbEls.forEach((orb, i) => {
          const isActive = active === i;
          orb.dataset.active = isActive ? "true" : "false";
          gsap.to(orb, {
            scale: isActive ? 1.18 : 1,
            boxShadow: isActive
              ? "0 0 28px rgba(122,53,255,0.65)"
              : orb.dataset.accent === "true"
                ? "0 0 18px rgba(122,53,255,0.35)"
                : "0 0 0 rgba(0,0,0,0)",
            backgroundColor:
              isActive || orb.dataset.accent === "true"
                ? "#7A35FF"
                : "rgba(41,45,50,0.35)",
            duration: 0.35,
            overwrite: "auto",
          });
        });
        steps.forEach((step, i) => {
          step.dataset.active = active === i ? "true" : "false";
        });
      };

      const deactivate = () => {
        activeRef.current = null;
        setOrbStates(null);
        const length = setLineLength();
        gsap.to(line, {
          strokeDashoffset: length,
          opacity: 0,
          duration: 0.35,
          ease: "power2.in",
        });
      };

      const activate = (index: number) => {
        activeRef.current = index;
        setOrbStates(index);
        updateLineToOrb(index);
        const length = setLineLength();
        line.style.strokeDasharray = `${length}`;
        gsap.fromTo(
          line,
          { strokeDashoffset: length, opacity: 0.15 },
          {
            strokeDashoffset: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power2.out",
            overwrite: "auto",
          }
        );
      };

      tickerFn = () => {
        if (activeRef.current === null) return;
        updateLineToOrb(activeRef.current);
        const length = setLineLength();
        line.style.strokeDasharray = `${length}`;
        line.style.strokeDashoffset = "0";
      };
      gsap.ticker.add(tickerFn);

      ctx = gsap.context(() => {
        gsap.set(section.querySelectorAll("[data-reveal]"), {
          opacity: 0,
          scale: 0.92,
          y: 20,
        });
        gsap.set(line, { opacity: 0 });

        const continuous: Array<ReturnType<typeof gsap.to>> = [];

        const startContinuous = () => {
          if (continuous.length) return;

          continuous.push(
            gsap.to(visual.querySelector("[data-ring]"), {
              rotate: 360,
              duration: 48,
              repeat: -1,
              ease: "none",
            })
          );

          if (hub) {
            continuous.push(
              gsap.to(hub, {
                scale: 1.045,
                boxShadow:
                  "0 0 70px rgba(41,45,50,0.45), 0 12px 40px rgba(41,45,50,0.28)",
                duration: 2.6,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              })
            );
          }

          orbitEls.forEach((orbit, i) => {
            const cfg = ORBS[i];
            if (!cfg) return;
            gsap.set(orbit, { rotate: cfg.startAngle });
            continuous.push(
              gsap.to(orbit, {
                rotate: cfg.startAngle + 360,
                duration: cfg.duration,
                repeat: -1,
                ease: "none",
              })
            );
          });

          orbEls
            .filter((orb) => orb.dataset.accent === "true")
            .forEach((orb, i) => {
              continuous.push(
                gsap.to(orb, {
                  boxShadow: "0 0 32px rgba(122,53,255,0.7)",
                  duration: 1.8 + i * 0.25,
                  yoyo: true,
                  repeat: -1,
                  ease: "sine.inOut",
                })
              );
            });
        };

        const pauseContinuous = (paused: boolean) => {
          continuous.forEach((tw) => tw.paused(paused));
        };

        gsap.to(section.querySelectorAll("[data-reveal]"), {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
            onEnter: () => startContinuous(),
          },
        });

        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onEnter: () => {
            startContinuous();
            pauseContinuous(false);
          },
          onEnterBack: () => pauseContinuous(false),
          onLeave: () => pauseContinuous(true),
          onLeaveBack: () => pauseContinuous(true),
        });

        const mm = gsap.matchMedia();

        mm.add("(hover: hover) and (pointer: fine)", () => {
          const cleanups: Array<() => void> = [];
          steps.forEach((step, index) => {
            const onEnter = () => activate(index);
            const onLeave = () => deactivate();
            step.addEventListener("mouseenter", onEnter);
            step.addEventListener("mouseleave", onLeave);
            step.addEventListener("focus", onEnter);
            step.addEventListener("blur", onLeave);
            cleanups.push(() => {
              step.removeEventListener("mouseenter", onEnter);
              step.removeEventListener("mouseleave", onLeave);
              step.removeEventListener("focus", onEnter);
              step.removeEventListener("blur", onLeave);
            });
          });
          return () => cleanups.forEach((fn) => fn());
        });

        mm.add("(hover: none), (pointer: coarse)", () => {
          const triggers = steps.map((step, index) =>
            ScrollTrigger.create({
              trigger: step,
              start: "top 70%",
              end: "bottom 35%",
              onEnter: () => activate(index),
              onEnterBack: () => activate(index),
              onLeave: () => {
                if (activeRef.current === index) deactivate();
              },
              onLeaveBack: () => {
                if (activeRef.current === index) deactivate();
              },
            })
          );
          return () => triggers.forEach((tr) => tr.kill());
        });
      }, section);
    })();

    return () => {
      cancelled = true;
      if (gsapRef && tickerFn) gsapRef.ticker.remove(tickerFn);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden border-y border-primary/5 bg-gradient-to-b from-background via-primary/[0.03] to-background px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <p
            data-reveal
            className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/60"
          >
            {t("eyebrow")}
          </p>
          <h2
            data-reveal
            className="mt-3 text-3xl font-semibold tracking-tight text-primary md:text-4xl"
          >
            {t("title")}
          </h2>
          <p data-reveal className="mt-4 max-w-xl text-muted-foreground">
            {t("description")}
          </p>
          <ul className="mt-8 space-y-4">
            {(["step1", "step2", "step3"] as const).map((step, index) => (
              <li
                key={step}
                data-reveal
                data-step={index}
                tabIndex={0}
                className={cn(
                  "group flex cursor-pointer gap-4 rounded-2xl border border-primary/8 bg-background/80 p-4 outline-none transition-colors",
                  "hover:border-accent/40 focus-visible:border-accent/50",
                  "data-[active=true]:border-accent/50 data-[active=true]:bg-accent/10"
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors group-data-[active=true]:bg-accent group-data-[active=true]:text-primary">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-primary">{t(`${step}.title`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`${step}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={visualRef}
          className="relative mx-auto aspect-square w-full max-w-md"
          aria-hidden
        >
          <div
            data-ring
            data-reveal
            className="absolute inset-[8%] rounded-full border border-dashed border-primary/25"
          />

          {ORBS.map((orb) => (
            <div
              key={orb.id}
              data-orbit
              data-reveal
              className="pointer-events-none absolute left-1/2 top-1/2 will-change-transform"
              style={{
                width: `${orb.radius * 2}%`,
                height: `${orb.radius * 2}%`,
                marginLeft: `-${orb.radius}%`,
                marginTop: `-${orb.radius}%`,
              }}
            >
              <div
                data-orb
                data-accent={orb.accent ? "true" : "false"}
                className={cn(
                  "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform",
                  orb.accent ? "bg-accent" : "bg-primary/35"
                )}
                style={{
                  width: `${orb.size * 4}px`,
                  height: `${orb.size * 4}px`,
                  boxShadow: orb.accent
                    ? "0 0 18px rgba(122,53,255,0.35)"
                    : undefined,
                }}
              />
            </div>
          ))}

          <div
            data-hub
            data-reveal
            className="absolute left-1/2 top-1/2 z-10 flex h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary will-change-transform"
            style={{
              boxShadow:
                "0 0 60px rgba(41,45,50,0.35), 0 10px 30px rgba(41,45,50,0.2)",
            }}
          >
            <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-primary-foreground">
              Bestcrea
            </p>
          </div>

          <svg
            className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-visible"
            aria-hidden
          >
            <line
              ref={lineRef}
              x1="50%"
              y1="50%"
              x2="50%"
              y2="50%"
              stroke="#7A35FF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
