"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { navRegistry } from "./navRegistry";

/**
 * Registers the App Router's `push` into `navRegistry` so non-React callers
 * (the assistant store) can navigate. Renders nothing; mounted once in the
 * dashboard shell alongside the assistant overlay.
 */
export function NavBridge() {
  const router = useRouter();
  useEffect(() => {
    navRegistry.go = (path) => router.push(path);
    return () => {
      navRegistry.go = null;
    };
  }, [router]);
  return null;
}
