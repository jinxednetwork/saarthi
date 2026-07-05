"use client";

import { useEffect } from "react";
import { useA11yStore } from "@/lib/a11y-store";

/**
 * Mounts once in the root layout. Adopts the persisted a11y settings on the
 * client and re-applies them (the pre-hydration script sets the initial state;
 * this keeps the zustand store in sync for the toolbar). Renders nothing.
 */
export function A11yRoot() {
  const hydrate = useA11yStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
