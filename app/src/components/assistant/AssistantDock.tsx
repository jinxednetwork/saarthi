"use client";

import { Sparkles } from "lucide-react";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useDashboardStore } from "@/lib/dashboard-store";

/**
 * The floating island on the dashboard map stage (≥lg; the overlay serves
 * smaller viewports). Collapsed: a glass pill inviting a question. Expanded:
 * the assistant panel rises above it. Lives in the map stage's centre column,
 * stacked above the MapToolbar.
 */
export function AssistantDock() {
  const { assistantOpen, openAssistant } = useDashboardStore();
  const { t } = useI18n();

  return (
    <div className="pointer-events-auto relative flex w-full flex-col items-center">
      {assistantOpen && (
        <AssistantPanel className="mb-2 h-[52vh] max-h-[560px] w-[460px] max-w-full animate-fadeIn" />
      )}
      {!assistantOpen && (
        <button
          onClick={openAssistant}
          className="glass-strong flex h-11 w-[420px] max-w-full items-center gap-2.5 rounded-full px-4 text-left transition-transform hover:scale-[1.015]"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-saffron" />
          <span className="flex-1 truncate text-[12.5px] text-faint">
            {t("assistant.dockPrompt")}
          </span>
          <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            AI
          </span>
        </button>
      )}
    </div>
  );
}
