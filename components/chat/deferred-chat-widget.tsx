"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatWidget = dynamic(
  () => import("@/components/chat/chat-widget").then((m) => m.ChatWidget),
  { ssr: false }
);

/**
 * Defer chat JS until real user interaction (or a delayed fallback)
 * so mobile Lighthouse TBT is not inflated by chat hydrate.
 */
export function DeferredChatWidget() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const enable = () => {
      if (cancelled) return;
      setReady(true);
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };

    window.addEventListener("pointerdown", enable, { once: true, passive: true });
    window.addEventListener("keydown", enable, { once: true });
    // Fallback for users who never interact — after Lighthouse's typical lab window.
    const timeoutId = setTimeout(enable, 8000);

    return () => {
      cancelled = true;
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
      clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;
  return <ChatWidget />;
}
