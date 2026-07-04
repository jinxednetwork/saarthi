"use client";

import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

/**
 * Sidebar AI launcher — sits at the bottom of the nav rail, above the MP
 * identity block. Toggles the assistant everywhere.
 */
export function AssistantLauncher({ collapsed }: { collapsed: boolean }) {
  const { assistantOpen, toggleAssistant } = useDashboardStore();

  const button = (
    <button
      onClick={toggleAssistant}
      aria-pressed={assistantOpen}
      aria-label={assistantOpen ? "Close Saarthi Assistant" : "Open Saarthi Assistant"}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 transition-colors",
        collapsed && "justify-center px-0",
        assistantOpen
          ? "bg-saffron/15 font-medium text-saffron"
          : "text-body hover:bg-chip hover:text-ink",
      )}
    >
      <Sparkles className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="flex-1 truncate text-left text-[13.5px]">Ask Saarthi</span>}
      {!collapsed && (
        <span className="rounded-full border border-line px-1.5 py-px text-[10px] uppercase tracking-wide text-faint">
          AI
        </span>
      )}
    </button>
  );

  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">Ask Saarthi · AI</TooltipContent>
    </Tooltip>
  ) : (
    button
  );
}
