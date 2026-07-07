"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SourceIcon } from "@/components/icons";
import { navigateTo } from "@/components/shell/navRegistry";
import { useDashboardStore } from "@/lib/dashboard-store";
import { URGENCY_UI } from "@/lib/ui";
import { cn } from "@/lib/utils";

interface Signal {
  id: string;
  source: "reddit" | "twitter" | "news";
  handle: string;
  url: string;
  createdAt: string;
  category: string;
  urgency: keyof typeof URGENCY_UI;
  sentiment: string;
  ward: string;
  summary: string;
  mode: "gemini" | "keyword";
}
interface IntakeResponse {
  signals: Signal[];
  lastRefresh: string | null;
  sources: Record<string, boolean>;
}

const CATEGORY_LABEL: Record<string, string> = {
  water: "Water",
  health: "Public health",
  air_quality: "Air quality",
  infrastructure: "Infrastructure",
  other: "Other",
};

/**
 * Live intake — real social posts (Reddit, and X via Apify) classified by
 * Gemini. The Google-AI showcase: each card's category, urgency, sentiment and
 * ward are model-assigned. Runs on labelled sample posts until Reddit/Apify
 * creds are set; the "Gemini"/"keyword" badge shows which classifier ran.
 */
export function LiveIntake() {
  const [data, setData] = useState<IntakeResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [promoting, setPromoting] = useState(false);
  const { promotedSignalIds, addPromotedCluster, selectCluster } = useDashboardStore();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function promote() {
    const ids = [...selected];
    if (ids.length === 0) return;
    setPromoting(true);
    try {
      const res = await fetch("/api/intake/promote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signalIds: ids }),
      });
      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(e.error ?? "Promote failed.");
        return;
      }
      const { cluster, promotedIds } = (await res.json()) as { cluster: Parameters<typeof addPromotedCluster>[0]; promotedIds: string[] };
      addPromotedCluster(cluster, promotedIds);
      setSelected(new Set());
      toast.success("Issue created", {
        description: cluster.title,
        action: {
          label: "View",
          onClick: () => {
            selectCluster(cluster.id);
            navigateTo("/dashboard");
          },
        },
      });
    } catch {
      toast.error("Promote failed.");
    } finally {
      setPromoting(false);
    }
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/intake", { cache: "no-store" });
      setData(await res.json());
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function refresh() {
    setBusy(true);
    try {
      const res = await fetch("/api/intake", { method: "POST" });
      const r = await res.json();
      if (typeof r.live === "boolean") setLive(r.live);
      await load();
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  const signals = data?.signals ?? [];
  const geminiOn = data?.sources.gemini;

  return (
    <section className="rounded-2xl border border-line/60 bg-surface p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Live from Reddit &amp; X</h2>
            <p className="text-[11.5px] text-muted-foreground">
              Classified by {geminiOn ? "Gemini 2.5 Flash" : "keyword fallback"} · category · urgency ·
              sentiment · ward
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {live === false && (
            <span className="rounded-full bg-chip px-2 py-0.5 text-[10.5px] font-medium text-muted-foreground">
              sample data
            </span>
          )}
          {live === true && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10.5px] font-medium text-success">
              live
            </span>
          )}
          <button
            onClick={refresh}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-body hover:border-line-dark disabled:opacity-60"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} />
            {busy ? "Fetching…" : "Refresh"}
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
          <span className="text-[12.5px] text-ink">
            {selected.size} signal{selected.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={promote}
            disabled={promoting}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-[12.5px] font-medium text-white hover:bg-primary-hover disabled:opacity-60"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {promoting ? "Creating issue…" : `Promote ${selected.size} to issue`}
          </button>
        </div>
      )}

      {signals.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-[13px] text-muted-foreground">
          No signals yet. Hit Refresh to pull civic posts and classify them.
        </p>
      ) : (
        <div className="mt-3 flex flex-col divide-y divide-line/50">
          {signals.map((s) => {
            const u = URGENCY_UI[s.urgency] ?? URGENCY_UI.low;
            const isPromoted = promotedSignalIds.includes(s.id);
            return (
              <div key={s.id} className={cn("flex gap-3 py-3", isPromoted && "opacity-50")}>
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  disabled={isPromoted}
                  onChange={() => toggle(s.id)}
                  aria-label={`Select signal: ${s.summary}`}
                  className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer accent-[hsl(var(--primary))] disabled:cursor-not-allowed"
                />
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chip text-body">
                  <SourceIcon source={s.source} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-faint">
                    <span className="font-medium text-muted-foreground">{s.handle}</span>
                    <span>·</span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-px text-[9.5px] font-medium uppercase tracking-wide",
                        s.mode === "gemini" ? "bg-primary/10 text-primary" : "bg-chip text-faint",
                      )}
                    >
                      {s.mode === "gemini" ? "Gemini" : "keyword"}
                    </span>
                    {isPromoted && (
                      <span className="rounded-full bg-success/15 px-1.5 py-px text-[9.5px] font-medium text-success">
                        promoted ✓
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-ink">{s.summary}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px]">
                    <span className="font-medium text-body">{CATEGORY_LABEL[s.category] ?? s.category}</span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.dot }} />
                      <span style={{ color: u.text }}>{u.label}</span>
                    </span>
                    <span className="text-muted-foreground">{s.sentiment}</span>
                    {s.ward !== "Unknown" && <span className="text-faint">· {s.ward}</span>}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-primary-link hover:underline"
                    >
                      source <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
