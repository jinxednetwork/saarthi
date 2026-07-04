"use client";

import { ChevronDown } from "lucide-react";
import { type PanelId, useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

/**
 * Shared glass panel with collapse-in-place: the body folds via the
 * grid-rows 1fr↔0fr trick (no height measuring, animates cleanly, instant
 * under reduced motion via the global override); the slim header stays with a
 * chevron. State persists per panel through the store → localStorage. The
 * panel root carries pointer-events-auto — its column must NOT, so collapsed
 * space stays map-draggable.
 */
export function CollapsiblePanel({
  id,
  title,
  headerRight,
  fill = false,
  children,
}: {
  id: PanelId;
  title: string;
  headerRight?: React.ReactNode;
  /** Expand to absorb the column's remaining height (queue/feed). */
  fill?: boolean;
  children: React.ReactNode;
}) {
  const collapsed = useDashboardStore((s) => s.collapsedPanels[id]);
  const togglePanel = useDashboardStore((s) => s.togglePanel);
  const bodyId = `panel-body-${id}`;

  return (
    <section
      className={cn(
        "glass-strong pointer-events-auto flex flex-col overflow-hidden rounded-xl",
        fill && !collapsed ? "min-h-0 flex-1" : "shrink-0",
      )}
    >
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 px-4">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        <div className="flex items-center gap-2">
          {!collapsed && headerRight}
          <button
            onClick={() => togglePanel(id)}
            aria-expanded={!collapsed}
            aria-controls={bodyId}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-chip hover:text-ink"
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                collapsed && "-rotate-90",
              )}
            />
          </button>
        </div>
      </header>

      <div
        id={bodyId}
        className={cn(
          "grid min-h-0 transition-[grid-template-rows] duration-300 ease-out",
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
          fill && !collapsed && "flex-1",
        )}
      >
        <div className="flex min-h-0 flex-col overflow-hidden border-t border-line/50">
          {children}
        </div>
      </div>
    </section>
  );
}
