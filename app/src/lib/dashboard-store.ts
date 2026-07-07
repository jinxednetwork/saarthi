"use client";

import { create } from "zustand";
import type { CitizenTicket, SubmissionSource, Urgency } from "@saarthi/shared";
import { matchAction } from "./assistant-actions";
import { SUGGESTED_CHIPS, type AssistantCitation, type AssistantMessage } from "./assistant-brain";
import { speak } from "./a11y-tts";
import type { CategoryGroup } from "./categories";
import { useDocumentsStore } from "./documents-store";
import { MOCK_CLUSTERS, RADIAL_CHANNELS, type DemoCluster, type FeedItem } from "./mock-data";
import { flyToCluster, focusMapArea, mapRegistry, type MapFocus } from "@/components/map/mapRegistry";
import { navigateTo } from "@/components/shell/navRegistry";

/**
 * Cross-component dashboard UI state (§3.3 — Zustand for map filters, selected
 * cluster, composer, shell). Component-local state (splash timer, feed tick,
 * radial hover) stays in the components.
 */
export type MapFilter = CategoryGroup | "all";
export type TimeRange = "7d" | "30d" | "90d";
export type SourceFilter = SubmissionSource | "all";

/** Sources the refresh actually pulls (X/Reddit/News); WhatsApp/Portal arrive by push/poll. */
const PULLABLE_SOURCES = ["twitter", "reddit", "news"] as const;
const SOURCES_KEY = "saarthi-disabled-sources";
const SOURCE_NAMES: Record<string, string> = Object.fromEntries(
  RADIAL_CHANNELS.map((c) => [c.key, c.name]),
);

/** Map a live intake signal (GET /api/intake) into a feed card. */
function signalToFeedItem(s: {
  source: SubmissionSource;
  handle: string;
  category: FeedItem["category"];
  summary?: string;
  text?: string;
  createdAt: string;
  mediaUrl?: string;
}): FeedItem {
  return {
    source: s.source,
    sourceName: SOURCE_NAMES[s.source] ?? s.source,
    category: s.category,
    timeMin: Math.max(0, Math.round((Date.now() - new Date(s.createdAt).getTime()) / 60000)),
    snippet: s.summary || s.text || "",
    link: `${s.handle} · live signal`,
    media: s.mediaUrl
      ? { type: "image", src: s.mediaUrl, aspect: "4/3", alt: `${s.handle} media`, external: true }
      : undefined,
  };
}

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
  /** Citizen ticket whose detail drawer is open (null = closed). */
  selectedTicketId: string | null;
  /** Latest polled citizen tickets, kept here so the ticket drawer can look one up without refetching. */
  citizenTickets: CitizenTicket[];
  /** Cluster the assistant just pointed the map at — pulses a highlight ring briefly. */
  highlightedClusterId: string | null;
  /** Urgency levels the legend has toggled on — markers off this list dim (empty = all normal). */
  urgencyEmphasis: Urgency[];
  /** Radar / AI overwatch: while on, synthesises live events and zooms into them. */
  radarOn: boolean;
  /** Synthetic radar events (rolling cap) rendered as extra markers. */
  liveEvents: DemoCluster[];
  /** Hotspot area queued for the map to frame on mount (cross-page assistant jumps). */
  pendingFocus: MapFocus | null;
  composerClusterId: string | null;
  /** Letters approved & dispatched this session, with their reference numbers. */
  dispatched: DispatchRecord[];
  /** Clusters the MP has marked closed/resolved this session (reopen = undo). */
  closedClusterIds: string[];
  /** Issues promoted from intake signals this session — surface on map/queue/drawer. */
  promotedClusters: DemoCluster[];
  /** Signal ids already promoted, so the intake list can block re-promoting. */
  promotedSignalIds: string[];
  /** Channels toggled OFF — hidden from the feed AND skipped on refresh. */
  disabledSources: string[];
  /** Real intake signals (X/Reddit/News) mapped to feed cards for the live feed. */
  liveSignals: FeedItem[];
  intakeRefreshing: boolean;
  lastIntakeRefresh: string | null;
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
  selectTicket(id: string): void;
  closeTicketDetail(): void;
  setCitizenTickets(tickets: CitizenTicket[]): void;
  highlightCluster(id: string): void;
  toggleUrgency(u: Urgency): void;
  toggleRadar(): void;
  addLiveEvent(evt: DemoCluster): void;
  resumeLastView(): void;
  /** Map reads + clears the queued focus once it has mounted. */
  consumePendingFocus(): MapFocus | null;
  openComposer(clusterId: string): void;
  closeComposer(): void;
  sendLetter(): void;
  closeCluster(id: string): void;
  reopenCluster(id: string): void;
  addPromotedCluster(cluster: DemoCluster, signalIds: string[]): void;
  toggleSource(key: string): void;
  hydrateSources(): void;
  loadLiveSignals(): Promise<void>;
  /** Pull enabled sources via POST /api/intake, reload signals; returns count added (-1 = error). */
  refreshIntake(): Promise<number>;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleSidebar(): void;
  togglePanel(id: PanelId): void;
  hydratePanels(): void;
  openAssistant(): void;
  closeAssistant(): void;
  toggleAssistant(): void;
  askAssistant(query: string, opts?: { voice?: boolean }): void;
}

export type PanelId = "kpis" | "queue" | "radial" | "feed";

const PANELS_KEY = "saarthi-panels";
const LAST_VIEW_KEY = "saarthi-last-view";
let msgSeq = 0;
let highlightTimer: ReturnType<typeof setTimeout> | undefined;

interface LastView {
  filter: MapFilter;
  clusterId: string | null;
}

function persistLastView(v: LastView) {
  try {
    localStorage.setItem(LAST_VIEW_KEY, JSON.stringify(v));
  } catch {}
}

/** True once a map engine has mounted and registered its handlers. */
function mapIsLive() {
  return mapRegistry.flyTo != null;
}

/**
 * Frame the map on a focus now if a map is mounted, else queue it and jump to
 * the dashboard — the map drains `pendingFocus` on mount. `radiusM` set → pulse
 * a zone; otherwise a single-point flyTo.
 */
function applyOrQueueFocus(focus: MapFocus) {
  if (mapIsLive()) {
    if (focus.radiusM != null) focusMapArea(focus);
    else flyToCluster(focus.lat, focus.lng, focus.zoom);
  } else {
    useDashboardStore.setState({ pendingFocus: focus });
    navigateTo("/dashboard");
  }
}

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

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeFilter: "all",
  timeRange: "30d",
  sourceFilter: "all",
  selectedClusterId: null,
  selectedTicketId: null,
  citizenTickets: [],
  highlightedClusterId: null,
  urgencyEmphasis: [],
  radarOn: false,
  liveEvents: [],
  pendingFocus: null,
  composerClusterId: null,
  dispatched: [],
  closedClusterIds: [],
  promotedClusters: [],
  promotedSignalIds: [],
  disabledSources: [],
  liveSignals: [],
  intakeRefreshing: false,
  lastIntakeRefresh: null,
  sidebarCollapsed: false,
  setFilter: (activeFilter) => {
    set({ activeFilter });
    persistLastView({ filter: activeFilter, clusterId: get().selectedClusterId });
  },
  setTimeRange: (timeRange) => set({ timeRange }),
  setSourceFilter: (sourceFilter) => set({ sourceFilter }),
  selectCluster: (selectedClusterId) => {
    set({ selectedClusterId });
    persistLastView({ filter: get().activeFilter, clusterId: selectedClusterId });
  },
  closeDetail: () => {
    set({ selectedClusterId: null });
    persistLastView({ filter: get().activeFilter, clusterId: null });
  },
  selectTicket: (selectedTicketId) => set({ selectedTicketId }),
  closeTicketDetail: () => set({ selectedTicketId: null }),
  setCitizenTickets: (citizenTickets) => set({ citizenTickets }),
  highlightCluster: (id) => {
    clearTimeout(highlightTimer);
    set({ highlightedClusterId: id });
    highlightTimer = setTimeout(() => set({ highlightedClusterId: null }), 2200);
  },
  toggleUrgency: (u) =>
    set((s) => ({
      urgencyEmphasis: s.urgencyEmphasis.includes(u)
        ? s.urgencyEmphasis.filter((x) => x !== u)
        : [...s.urgencyEmphasis, u],
    })),
  toggleRadar: () => set((s) => ({ radarOn: !s.radarOn })),
  addLiveEvent: (evt) => set((s) => ({ liveEvents: [...s.liveEvents, evt].slice(-6) })),
  consumePendingFocus: () => {
    const focus = get().pendingFocus;
    if (focus) set({ pendingFocus: null });
    return focus;
  },
  resumeLastView: () => {
    try {
      const raw = localStorage.getItem(LAST_VIEW_KEY);
      if (!raw) return;
      const v = JSON.parse(raw) as LastView;
      set({ activeFilter: v.filter, selectedClusterId: v.clusterId });
      if (v.clusterId) {
        get().highlightCluster(v.clusterId);
        const c = MOCK_CLUSTERS.find((x) => x.id === v.clusterId);
        if (c) applyOrQueueFocus({ lat: c.geo.centroid.lat, lng: c.geo.centroid.lng, zoom: 15 });
      }
    } catch {}
  },
  openComposer: (composerClusterId) => set({ composerClusterId }),
  closeComposer: () => set({ composerClusterId: null }),
  sendLetter: () =>
    set((s) => {
      const id = s.composerClusterId;
      if (!id || s.dispatched.some((d) => d.id === id)) return {};
      return { dispatched: [{ id, ref: letterRef(id) }, ...s.dispatched] };
    }),
  // ponytail: session-only, matches `dispatched`. Persist to localStorage (like
  // collapsedPanels) if it must survive reload; Firestore only if clusters become real docs.
  closeCluster: (id) =>
    set((s) => (s.closedClusterIds.includes(id) ? {} : { closedClusterIds: [id, ...s.closedClusterIds] })),
  reopenCluster: (id) =>
    set((s) => ({ closedClusterIds: s.closedClusterIds.filter((x) => x !== id) })),
  // ponytail: session-only, matches dispatched/closedClusterIds. Persist to
  // localStorage or Firestore if promoted issues must outlive the session.
  addPromotedCluster: (cluster, signalIds) =>
    set((s) => ({
      promotedClusters: [cluster, ...s.promotedClusters],
      promotedSignalIds: [...s.promotedSignalIds, ...signalIds],
    })),
  toggleSource: (key) =>
    set((s) => {
      const disabledSources = s.disabledSources.includes(key)
        ? s.disabledSources.filter((k) => k !== key)
        : [...s.disabledSources, key];
      try {
        localStorage.setItem(SOURCES_KEY, JSON.stringify(disabledSources));
      } catch {}
      return { disabledSources };
    }),
  hydrateSources: () => {
    try {
      const raw = localStorage.getItem(SOURCES_KEY);
      if (raw) set({ disabledSources: JSON.parse(raw) });
    } catch {}
  },
  loadLiveSignals: async () => {
    try {
      const res = await fetch("/api/intake", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.signals)) {
        set({ liveSignals: data.signals.map(signalToFeedItem) });
      }
    } catch {
      /* offline — feed keeps its mock/ticket items */
    }
  },
  refreshIntake: async () => {
    if (get().intakeRefreshing) return 0;
    set({ intakeRefreshing: true });
    try {
      const sources = PULLABLE_SOURCES.filter((s) => !get().disabledSources.includes(s));
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sources }),
      });
      const data = (await res.json().catch(() => ({}))) as { added?: number };
      await get().loadLiveSignals();
      set({ lastIntakeRefresh: new Date().toISOString() });
      return typeof data.added === "number" ? data.added : 0;
    } catch {
      return -1;
    } finally {
      set({ intakeRefreshing: false });
    }
  },
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
  askAssistant: (query, opts) => {
    const q = query.trim();
    if (!q) return;
    const voice = opts?.voice ?? false;
    const aId = `a${++msgSeq}`;
    set((s) => ({
      assistantOpen: true,
      assistantThinking: true,
      assistantMessages: [
        ...s.assistantMessages,
        { id: `u${++msgSeq}`, role: "user", text: q },
      ],
    }));

    // Command-shaped queries ("show me water issues", "highlight Karol Bagh",
    // "take me to MPLADS", "resume where I left off") are resolved locally and
    // never hit /api/assistant — fast, offline-safe, no Gemini dependency.
    const action = matchAction(q);
    if (action) {
      if (action.kind === "navigate") {
        navigateTo(action.route!);
      } else if (action.kind === "resume") {
        get().resumeLastView();
      } else {
        // Map commands: apply filter/selection, then frame the map. If the map
        // isn't mounted (we're on another page), queue the focus + jump to the
        // dashboard — the map drains pendingFocus on mount.
        if (action.filter) get().setFilter(action.filter);
        if (action.kind === "filter-open") {
          get().selectCluster(action.clusterId!);
          get().highlightCluster(action.clusterId!);
        }
        const focus: MapFocus | undefined =
          action.focus ?? (action.centroid ? { ...action.centroid, zoom: 15 } : undefined);
        if (focus) applyOrQueueFocus(focus);
      }

      set((s) => ({
        assistantThinking: false,
        assistantMessages: [
          ...s.assistantMessages,
          { id: aId, role: "assistant", text: action.text, chips: SUGGESTED_CHIPS },
        ],
      }));
      if (voice) speak(action.text, document.documentElement.lang);
      return;
    }

    // Grounded answer streams from /api/assistant (Gemini + RAG). Citations and
    // chips arrive up-front in the header; the body streams into one assistant
    // message. The route falls back to the scripted brain server-side, so this
    // path is identical with or without a Gemini key.
    void (async () => {
      let started = false;
      try {
        // Attach the MP's uploaded-document chunks so the Assistant can answer
        // over their own correspondence (R3C5). Empty until documents exist.
        const docChunks = useDocumentsStore.getState().assistantChunks();
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: q, docChunks }),
        });
        const meta = decodeAssistantMeta(res.headers.get("x-saarthi-meta"));

        let text = "";
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
        if (voice) speak(text, document.documentElement.lang);
      } catch {
        // Mid-stream failure: a message with id `aId` may already be rendered, so
        // reusing it here would duplicate the React key. Keep the partial answer
        // and only surface the error bubble when nothing streamed yet.
        if (started) {
          set({ assistantThinking: false });
          return;
        }
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
