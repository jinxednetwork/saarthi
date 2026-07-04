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
  composerClusterId: string | null;
  /** Cluster ids whose MPLADS letter was approved & sent this session. */
  dispatched: string[];
  /** Shell */
  sidebarCollapsed: boolean;
  /** Transitional (C3 removes with MapSection) */
  mapFilterOpen: boolean;
  toggleMapFilter(): void;
  closeMapFilter(): void;
  setFilter(filter: MapFilter): void;
  setTimeRange(range: TimeRange): void;
  openComposer(clusterId: string): void;
  closeComposer(): void;
  sendLetter(): void;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebar(): void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeFilter: "all",
  timeRange: "30d",
  composerClusterId: null,
  dispatched: [],
  sidebarCollapsed: false,
  mapFilterOpen: false,
  toggleMapFilter: () => set((s) => ({ mapFilterOpen: !s.mapFilterOpen })),
  closeMapFilter: () => set({ mapFilterOpen: false }),
  setFilter: (activeFilter) => set({ activeFilter, mapFilterOpen: false }),
  setTimeRange: (timeRange) => set({ timeRange }),
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
  setSidebarCollapsed: (sidebarCollapsed) => {
    set({ sidebarCollapsed });
    try {
      localStorage.setItem("saarthi-sidebar", sidebarCollapsed ? "1" : "0");
    } catch {}
  },
  toggleSidebar: () =>
    set((s) => {
      const collapsed = !s.sidebarCollapsed;
      try {
        localStorage.setItem("saarthi-sidebar", collapsed ? "1" : "0");
      } catch {}
      return { sidebarCollapsed: collapsed };
    }),
}));
