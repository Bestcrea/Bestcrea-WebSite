"use client";

import { useEffect, useState } from "react";

export type AuthState = { loaded: boolean; loggedIn: boolean; role: string | null };

/**
 * Lightweight session check for public pages. Fetches /api/auth/session on mount so the public
 * layout stays statically rendered (no server-side session read, no SessionProvider needed).
 */
export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({ loaded: false, loggedIn: false, role: null });
  useEffect(() => {
    let alive = true;
    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: { role?: string } } | null) => {
        if (alive) setState({ loaded: true, loggedIn: !!data?.user, role: data?.user?.role ?? null });
      })
      .catch(() => alive && setState({ loaded: true, loggedIn: false, role: null }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
