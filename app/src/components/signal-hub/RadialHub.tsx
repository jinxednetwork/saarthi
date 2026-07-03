"use client";

import { useState } from "react";
import { DASHBOARD_META, RADIAL_CHANNELS } from "@/lib/mock-data";

const CX = 250;
const CY = 210;
const RING_R = 140;
const INNER_R = 72;
const LABEL_R = RING_R + 34;

/**
 * Radial signal hub (design): five intake channels as spokes around a hub;
 * hover a source to inspect its count/trend in the centre.
 */
export function RadialHub() {
  const [hovered, setHovered] = useState<string | null>(null);
  const hoveredChannel = RADIAL_CHANNELS.find((c) => c.key === hovered) ?? null;

  return (
    <div className="relative w-full max-w-[500px]" style={{ aspectRatio: "500 / 420" }}>
      <svg viewBox="0 0 500 420" className="block h-full w-full overflow-visible">
        {/* Concentric guide rings */}
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#EDE7D7" strokeWidth={1} strokeDasharray="2 5" />
        <circle cx={CX} cy={CY} r={90} fill="none" stroke="#F1EBDD" strokeWidth={1} strokeDasharray="1 4" />

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
          const isHovered = hovered === ch.key;
          const dim = hovered !== null && !isHovered;

          return (
            <g
              key={ch.key}
              className="cursor-pointer transition-opacity duration-200"
              style={{ opacity: dim ? 0.32 : 1 }}
              onMouseEnter={() => setHovered(ch.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <line
                x1={lx1}
                y1={ly1}
                x2={x}
                y2={y}
                stroke={isHovered ? ch.color : "#CDC5B4"}
                strokeWidth={isHovered ? 1.5 : 1}
                className="transition-[stroke] duration-200"
              />
              <circle
                cx={x}
                cy={y}
                r={14}
                fill={ch.color}
                opacity={isHovered ? 0.22 : ch.live ? 0.14 : 0}
                className="transition-opacity duration-200"
              />
              <circle cx={x} cy={y} r={6.5} fill={ch.color} stroke="#FFFFFF" strokeWidth={2} />
              <text
                x={labelX}
                y={labelY}
                textAnchor={anchor}
                style={{ fontSize: 12.5, fontWeight: 500, fill: "#14192A" }}
              >
                {ch.name}
              </text>
              <text
                x={labelX}
                y={labelY}
                dy={16}
                textAnchor={anchor}
                className="num"
                style={{ fontSize: 11.5, fill: "#A69C86" }}
              >
                {ch.count.toLocaleString("en-IN")}
              </text>
            </g>
          );
        })}

        {/* Centre hub */}
        <circle cx={CX} cy={CY} r={72} fill="#FFFFFF" stroke="#EDE7D7" strokeWidth={1} />
        <circle cx={CX} cy={CY} r={62} fill="none" stroke="#F1EBDD" strokeWidth={1} />
      </svg>

      {/* Centre overlay — summary or hovered channel detail */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-[130px] -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="mb-1.5 text-[10.5px] uppercase tracking-[0.08em] text-faint">
          {hoveredChannel ? hoveredChannel.name : "This week"}
        </div>
        <div className="num text-[30px] font-medium leading-none tracking-tight text-ink">
          {(hoveredChannel?.count ?? DASHBOARD_META.signalsThisWeek).toLocaleString("en-IN")}
        </div>
        <div
          className={`mt-1.5 text-[11.5px] ${
            hoveredChannel ? "font-medium text-success" : "text-faint"
          }`}
        >
          {hoveredChannel
            ? `${hoveredChannel.trend} · this week`
            : `signals · ${DASHBOARD_META.sourceCount} sources`}
        </div>
      </div>

      <div className="pt-2.5 text-center text-[11.5px] text-faint">
        Hover a source to inspect · click to filter
      </div>
    </div>
  );
}
