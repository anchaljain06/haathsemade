"use client";

import { useSyncExternalStore } from "react";

// Module-scope constants so the subscription identity is stable across renders.
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns false during SSR and the first (hydrating) client render, then true.
 *
 * Use it to gate anything read from localStorage — a persisted cart count, for
 * instance — so the server and client agree on the first paint. Preferred over
 * a useState + useEffect flag, which triggers a cascading render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
