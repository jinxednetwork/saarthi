"use client";

/**
 * First-run onboarding gate. Persisted once-ever (localStorage), distinct from
 * the per-session welcome splash. When not yet onboarded, the onboarding flow
 * replaces the splash as the first-run experience.
 */
const KEY = "saarthi-onboarded";

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true; // fail closed — never trap a user who has no storage
  }
}

export function setOnboarded(): void {
  try {
    localStorage.setItem(KEY, "1");
    // Suppress this session's welcome splash — onboarding was the welcome.
    sessionStorage.setItem("saarthi-splash-seen", "1");
  } catch {}
}
