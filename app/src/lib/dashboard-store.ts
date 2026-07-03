"use client";

import { create } from "zustand";
import type { CategoryGroup } from "./categories";

/**
 * Cross-component dashboard UI state (§3.3 — Zustand for map filters, selected
 * cluster, composer). Component-local state (splash timer, feed tick, radial
 * hover) stays in the components.
 */
export type MapFilter = CategoryGroup | "all";
export type TimeRange = "7d" | "30d" | "90d";

interface DashboardState {
  activeFilter: MapFilter;
  timeRange: TimeRange;
  mapFilterOpen: boolean;
  composerClusterId: string | null;
  /** Cluster ids whose MPLADS letter was approved & sent this session. */
  dispatched: string[];
  setFilter(filter: MapFilter): void;
  setTimeRange(range: TimeRange): void;
  toggleMapFilter(): void;
  closeMapFilter(): void;
  openComposer(clusterId: string): void;
  closeComposer(): void;
  sendLetter(): void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeFilter: "all",
  timeRange: "30d",
  mapFilterOpen: false,
  composerClusterId: null,
  dispatched: [],
  setFilter: (activeFilter) => set({ activeFilter, mapFilterOpen: false }),
  setTimeRange: (timeRange) => set({ timeRange }),
  toggleMapFilter: () => set((s) => ({ mapFilterOpen: !s.mapFilterOpen })),
  closeMapFilter: () => set({ mapFilterOpen: false }),
  openComposer: (composerClusterId) => set({ composerClusterId }),
  closeComposer: () => set({ composerClusterId: null }),
  sendLetter: () =>
    set((s) => ({
      composerClusterId: null,
      dispatched:
        s.composerClusterId && !s.dispatched.includes(s.composerClusterId)
          ? [s.composerClusterId, ...s.dispatched]
          : s.dispatched,
    })),
}));
