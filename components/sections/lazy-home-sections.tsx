"use client";

import { type ReactNode, useCallback } from "react";
import { ViewportLazy } from "@/components/sections/lazy-section";

export function LazyPresentation({ children }: { children: ReactNode }) {
  const loader = useCallback(
    () => import("@/components/sections/presentation-animation"),
    []
  );
  return (
    <ViewportLazy loader={loader} minHeight="28rem">
      {children}
    </ViewportLazy>
  );
}

export function LazyImpactStats({ children }: { children: ReactNode }) {
  const loader = useCallback(
    () => import("@/components/sections/impact-stats"),
    []
  );
  return (
    <ViewportLazy loader={loader} minHeight="22rem">
      {children}
    </ViewportLazy>
  );
}

export function LazyDomainCheck({ children }: { children: ReactNode }) {
  const loader = useCallback(
    () =>
      import("@/components/sections/domain-check").then((m) => ({
        default: m.DomainCheck,
      })),
    []
  );
  return (
    <ViewportLazy loader={loader} minHeight="20rem">
      {children}
    </ViewportLazy>
  );
}

export function LazyFaq({ children }: { children: ReactNode }) {
  const loader = useCallback(
    () =>
      import("@/components/sections/faq-accordion").then((m) => ({
        default: m.FaqAccordion,
      })),
    []
  );
  return (
    <ViewportLazy loader={loader} minHeight="24rem">
      {children}
    </ViewportLazy>
  );
}

export function LazyWebsiteShowcase({ children }: { children: ReactNode }) {
  const loader = useCallback(
    () =>
      import("@/components/sections/website-showcase").then((m) => ({
        default: m.WebsiteShowcase,
      })),
    []
  );
  return (
    <ViewportLazy loader={loader} minHeight="32rem" rootMargin="80px 0px">
      {children}
    </ViewportLazy>
  );
}

export function LazyWhyClientsChoose({ children }: { children: ReactNode }) {
  const loader = useCallback(
    () => import("@/components/sections/why-clients-choose"),
    []
  );
  return (
    <ViewportLazy loader={loader} minHeight="100vh" rootMargin="120px 0px">
      {children}
    </ViewportLazy>
  );
}
