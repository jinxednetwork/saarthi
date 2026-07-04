"use client";

import { create } from "zustand";
import type { SubmissionSource } from "@saarthi/shared";
import { SUGGESTED_CHIPS, type AssistantCitation, type AssistantMessage } from "./assistant-brain";
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

interface AssistantMeta {
  citations: AssistantCitation[];
  chips: string[];
}

/** Decode the base64/utf-8 meta header the assistant route sends alongside the streamed body. */
function decodeAssistantMeta(raw: string | null): AssistantMeta {
  if (!raw) return { citations: [], chips: SUGGESTED_CHIPS };
  try {
    const json = new TextDecoder().decode(Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)));
    const meta = JSON.parse(json) as Partial<AssistantMeta>;
    return { citations: meta.citations ?? [], chips: meta.chips ?? [] };
  } catch {
    return { citations: [], chips: [] };
  }
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
    const aId = `a${++msgSeq}`;
    set((s) => ({
      assistantOpen: true,
      assistantThinking: true,
      assistantMessages: [
        ...s.assistantMessages,
        { id: `u${++msgSeq}`, role: "user", text: q },
      ],
    }));

    // Grounded answer streams from /api/assistant (Gemini + RAG). Citations and
    // chips arrive up-front in the header; the body streams into one assistant
    // message. The route falls back to the scripted brain server-side, so this
    // path is identical with or without a Gemini key.
    void (async () => {
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        const meta = decodeAssistantMeta(res.headers.get("x-saarthi-meta"));

        let text = "";
        let started = false;
        const render = (chunk: string) => {
          text += chunk;
          set((s) => {
            if (!started) {
              started = true;
              return {
                assistantThinking: false,
                assistantMessages: [
                  ...s.assistantMessages,
                  { id: aId, role: "assistant", text, citations: meta.citations, chips: meta.chips },
                ],
              };
            }
            return {
              assistantMessages: s.assistantMessages.map((m) =>
                m.id === aId ? { ...m, text } : m,
              ),
            };
          });
        };

        const body = res.body;
        if (body && typeof body.getReader === "function") {
          const reader = body.getReader();
          const dec = new TextDecoder();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) render(dec.decode(value, { stream: true }));
          }
          render(dec.decode());
        } else {
          render(await res.text());
        }
        if (!started) render(""); // ensure a message exists even on an empty stream
        set({ assistantThinking: false });
      } catch {
        set((s) => ({
          assistantThinking: false,
          assistantMessages: [
            ...s.assistantMessages,
            {
              id: aId,
              role: "assistant",
              text: "I couldn't reach the assistant service just now. Please try again in a moment.",
              chips: SUGGESTED_CHIPS,
            },
          ],
        }));
      }
    })();
  },
}));
