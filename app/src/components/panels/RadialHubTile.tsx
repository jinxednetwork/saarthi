"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { CollapsiblePanel } from "@/components/panels/CollapsiblePanel";
import { useDashboardStore } from "@/lib/dashboard-store";
import { DASHBOARD_META, RADIAL_CHANNELS } from "@/lib/mock-data";

const CX = 180;
const CY = 120;
const RING_R = 76;
const INNER_R = 42;
const LABEL_R = RING_R + 24;

/**
 * Signal-sources tile — the radial hub as a collapsible instrument. Spokes are
 * real buttons: click (or Enter) filters the live feed by channel; click again
 * to clear. Hover/focus previews the channel in the hub centre.
 */
export function RadialHubTile() {
  const { t } = useI18n();
  const { sourceFilter, setSourceFilter } = useDashboardStore();
  const [hovered, setHovered] = useState<string | null>(null);

  const previewKey = hovered ?? (sourceFilter !== "all" ? sourceFilter : null);
  const preview = RADIAL_CHANNELS.find((c) => c.key === previewKey) ?? null;

  return (
    <CollapsiblePanel
      id="radial"
      title={t("panel.signalSources")}
      headerRight={
        <span className="text-[11px] text-faint">
          {sourceFilter === "all" ? "this week" : "filtering feed"}
        </span>
      }
    >
      <div className="px-4 pb-1 pt-1">
        <svg
          viewBox="0 0 360 240"
          className="block w-full overflow-visible"
          role="group"
          aria-label="Intake channels — activate a channel to filter the live feed"
        >
          <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="hsl(var(--line))" strokeWidth={1} strokeDasharray="2 5" />

          {RADIAL_CHANNELS.map((ch) => {
            const a = (ch.angle * Math.PI) / 180;
            const sin = Math.sin(a);
            const cos = Math.cos(a);
            const x = CX + RING_R * sin;
            const y = CY - RING_R * cos;
            const lx1 = CX + INNER_R * sin;
            const ly1 = CY - INNER_R * cos;
            const labelX = CX + LABEL_R * sin;
            const labelY = CY - LABEL_R * cos;
            const anchor = sin > 0.3 ? "start" : sin < -0.3 ? "end" : "middle";
            const isActive = sourceFilter === ch.key;
            const isHovered = hovered === ch.key;
            const dim = (hovered !== null || sourceFilter !== "all") && !isHovered && !isActive;
            const color = ch.key === "twitter" ? "hsl(var(--ink))" : ch.color;

            return (
              <g
                key={ch.key}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${ch.name}: ${ch.count} signals. ${isActive ? "Clear filter" : "Filter feed"}`}
                className="cursor-pointer outline-offset-4 transition-opacity duration-200"
                style={{ opacity: dim ? 0.35 : 1 }}
                onMouseEnter={() => setHovered(ch.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(ch.key)}
                onBlur={() => setHovered(null)}
                onClick={() => setSourceFilter(isActive ? "all" : ch.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSourceFilter(isActive ? "all" : ch.key);
                  }
                }}
              >
                <line
                  x1={lx1}
                  y1={ly1}
                  x2={x}
                  y2={y}
                  stroke={isHovered || isActive ? color : "hsl(var(--line-dark))"}
                  strokeWidth={isHovered || isActive ? 1.5 : 1}
                />
                <circle cx={x} cy={y} r={11} fill={color} opacity={isHovered || isActive ? 0.25 : ch.live ? 0.14 : 0} />
                <circle cx={x} cy={y} r={5.5} fill={color} stroke="hsl(var(--surface))" strokeWidth={2} />
                <text x={labelX} y={labelY} textAnchor={anchor} style={{ fontSize: 11, fontWeight: 500, fill: "hsl(var(--ink))" }}>
                  {ch.name}
                </text>
                <text x={labelX} y={labelY} dy={13} textAnchor={anchor} className="num" style={{ fontSize: 10, fill: "hsl(var(--faint))" }}>
                  {ch.count.toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={INNER_R} fill="hsl(var(--surface))" stroke="hsl(var(--line))" strokeWidth={1} />

          <text x={CX} y={CY - 12} textAnchor="middle" style={{ fontSize: 8.5, letterSpacing: "0.08em", fill: "hsl(var(--faint))" }}>
            {(preview ? preview.name : "THIS WEEK").toUpperCase()}
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" className="num" style={{ fontSize: 20, fontWeight: 600, fill: "hsl(var(--ink))" }}>
            {(preview?.count ?? DASHBOARD_META.signalsThisWeek).toLocaleString("en-IN")}
          </text>
          <text x={CX} y={CY + 22} textAnchor="middle" style={{ fontSize: 9, fill: preview ? "hsl(var(--success))" : "hsl(var(--faint))" }}>
            {preview ? `${preview.trend} · this week` : `signals · ${DASHBOARD_META.sourceCount} sources`}
          </text>
        </svg>
      </div>
    </CollapsiblePanel>
  );
}
