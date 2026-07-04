"use client";

import { usePathname } from "next/navigation";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

/**
 * Floating assistant for every surface the dock doesn't cover: all
 * non-dashboard pages at any size, and the dashboard below lg (where the dock
 * is hidden). Fixed bottom-right, under the drawer/dialog layer (z-40 < 50).
 */
export function AssistantOverlay() {
  const assistantOpen = useDashboardStore((s) => s.assistantOpen);
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";

  if (!assistantOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-3 bottom-3 z-40 lg:inset-x-auto lg:bottom-6 lg:right-6",
        isDashboard && "lg:hidden",
      )}
    >
      <AssistantPanel className="h-[60vh] max-h-[600px] w-full animate-fadeIn lg:w-[420px]" />
    </div>
  );
}
