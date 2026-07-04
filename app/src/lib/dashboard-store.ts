"use client";

import { create } from "zustand";
import type { SubmissionSource } from "@saarthi/shared";
import { ask, SUGGESTED_CHIPS, type AssistantMessage } from "./assistant-brain";
import type { CategoryGroup } from "./categories";

/**
 * Cross-component dashboard UI state (§3.3 — Zustand for map filters, selected
 * cluster, composer, shell). Component-local state (splash timer, feed tick,
 * radial hover) stays in the components.
 */
export type MapFilter = CategoryGroup | "all";
export type TimeRange = "7d" | "30d" | "90d";
export type SourceFilter = SubmissionSource | "all";

export interface DispatchRecord {
  id: string;
  /** Official reference number, e.g. MP-NDL-MPLADS-2026-W44-001. */
  ref: string;
}

/** Single source for reference-number format (composer + feed + drawer). */
export function letterRef(clusterId: string): string {
  return `MP-NDL-MPLADS-2026-W44-${clusterId.replace("cl_", "0")}`;
}

interface DashboardState {
  activeFilter: MapFilter;
  timeRange: TimeRange;
  /** Radial-hub spoke filter — narrows the live feed panel by channel. */
  sourceFilter: SourceFilter;
  /** Cluster whose detail drawer is open (null = closed). */
  selectedClusterId: string | null;
  composerClusterId: string | null;
  /** Letters approved & dispatched this session, with their reference numbers. */
  dispatched: DispatchRecord[];
  /** Shell */
  sidebarCollapsed: boolean;
  /** Collapsible dashboard panels (persisted). */
  collapsedPanels: Record<PanelId, boolean>;
  /** Saarthi Assistant (session-only thread). */
  assistantOpen: boolean;
  assistantThinking: boolean;
  assistantMessages: AssistantMessage[];
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
  togglePanel(id: PanelId): void;
  hydratePanels(): void;
  openAssistant(): void;
  closeAssistant(): void;
  toggleAssistant(): void;
  askAssistant(query: string): void;
}

export type PanelId = "kpis" | "queue" | "radial" | "feed";

const PANELS_KEY = "saarthi-panels";
let msgSeq = 0;

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
    set((s) => {
      const id = s.composerClusterId;
      if (!id || s.dispatched.some((d) => d.id === id)) return {};
      return { dispatched: [{ id, ref: letterRef(id) }, ...s.dispatched] };
    }),
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
  collapsedPanels: { kpis: false, queue: false, radial: false, feed: false },
  togglePanel: (id) =>
    set((s) => {
      const collapsedPanels = { ...s.collapsedPanels, [id]: !s.collapsedPanels[id] };
      try {
        localStorage.setItem(PANELS_KEY, JSON.stringify(collapsedPanels));
      } catch {}
      return { collapsedPanels };
    }),
  hydratePanels: () => {
    try {
      const raw = localStorage.getItem(PANELS_KEY);
      if (raw) set({ collapsedPanels: { ...JSON.parse(raw) } });
    } catch {}
  },
  assistantOpen: false,
  assistantThinking: false,
  assistantMessages: [
    {
      id: "welcome",
      role: "assistant",
      text: "Namaste. I answer from this constituency's live signals, budget, and actions — every claim cited.",
      chips: SUGGESTED_CHIPS,
    },
  ],
  openAssistant: () => set({ assistantOpen: true }),
  closeAssistant: () => set({ assistantOpen: false }),
  toggleAssistant: () => set((s) => ({ assistantOpen: !s.assistantOpen })),
  askAssistant: (query) => {
    const q = query.trim();
    if (!q) return;
    set((s) => ({
      assistantOpen: true,
      assistantThinking: true,
      assistantMessages: [
        ...s.assistantMessages,
        { id: `u${++msgSeq}`, role: "user", text: q },
      ],
    }));
    // Scripted brain answers after a short "thinking" beat; Gemini replaces
    // this call in Phase 4 with the same message contract.
    setTimeout(() => {
      const answer = ask(q);
      set((s) => ({
        assistantThinking: false,
        assistantMessages: [
          ...s.assistantMessages,
          {
            id: `a${++msgSeq}`,
            role: "assistant",
            text: answer.text,
            citations: answer.citations,
            chips: answer.chips,
          },
        ],
      }));
    }, 650);
  },
}));
