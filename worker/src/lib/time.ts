import type { Timestamp } from "@saarthi/shared";

/** Build an SDK-agnostic Timestamp from epoch millis (mirrors the app helper). */
export function ts(ms: number): Timestamp {
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1e6,
    toDate: () => new Date(ms),
    toMillis: () => ms,
  };
}
