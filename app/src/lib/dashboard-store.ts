"use client";

import { create } from "zustand";
import type { SubmissionSource } from "@saarthi/shared";
import type { CategoryGroup } from "./categories";

/**
 * Cross-component dashboard UI state (§3.3 — Zustand for map filters, selected
 * cluster, composer, shell). Component-local state (splash timer, feed tick,
 * radial hover) stays in the components.
 */
export type MapFilter = CategoryGroup | "all";
export type TimeRange = "7d" | "30d" | "90d";
export type SourceFilter = SubmissionSource | "all";

interface DashboardState {
  activeFilter: MapFilter;
  timeRange: TimeRange;
  /** Radial-hub spoke filter — narrows the live feed panel by channel. */
  sourceFilter: SourceFilter;
  /** Cluster whose detail drawer is open (null = closed). */
  selectedClusterId: string | null;
  composerClusterId: string | null;
  /** Cluster ids whose MPLADS letter was approved & sent this session. */
  dispatched: string[];
  /** Shell */
  sidebarCollapsed: boolean;
  setFilter(filter: MapFilter): void;
  setTimeRange(range: TimeRange): void;
  setSourceFilter(filter: SourceFilter): void;
  selectCluster(id: string): void;
  closeDetail(): void;
  openComposer(clusterId: string): void;
  closeComposer(): void;
  sendLetter(): void;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebar(): void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeFilter: "all",
  timeRange: "30d",
  sourceFilter: "all",
  selectedClusterId: null,
  composerClusterId: null,
  dispatched: [],
  sidebarCollapsed: false,
  setFilter: (activeFilter) => set({ activeFilter }),
  setTimeRange: (timeRange) => set({ timeRange }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  selectCluster: (selectedClusterId) => set({ selectedClusterId }),
  closeDetail: () => set({ selectedClusterId: null }),
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
