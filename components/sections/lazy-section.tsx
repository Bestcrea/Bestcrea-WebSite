"use client";

import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type ViewportLazyProps = {
  children: ReactNode;
  loader: () => Promise<{ default: ComponentType }>;
  rootMargin?: string;
  minHeight?: string;
};

/**
 * Shows Server Component children until near viewport, then swaps in the
 * heavy client module. `loader` must be defined in a Client Component file
 * (cannot be passed from a Server Component).
 */
export function ViewportLazy({
  children,
  loader,
  rootMargin = "200px 0px",
  minHeight,
}: ViewportLazyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<ComponentType | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void loader().then((mod) => {
          if (!cancelled) setComponent(() => mod.default);
        });
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(node);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [loader, rootMargin]);

  return (
    <div ref={ref} style={minHeight ? { minHeight } : undefined}>
      {Component ? <Component /> : children}
    </div>
  );
}
