"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, ExternalLink, FileText, Sparkles, X } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useStagedReveal } from "@/components/assistant/useStagedReveal";
import type { AssistantCitation, AssistantMessage } from "@/lib/assistant-brain";
import { useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

/**
 * The Saarthi Assistant thread — shared by the dashboard dock and the
 * floating overlay. Every assistant claim carries citations: cluster chips
 * open the detail drawer, route links navigate, dataset links open the real
 * portals. Esc closes (guarded so an open Radix dialog wins the keypress).
 */
export function AssistantPanel({ className }: { className?: string }) {
  const { assistantMessages, assistantThinking, askAssistant, closeAssistant, selectCluster } =
    useDashboardStore();
  const { t } = useI18n();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [assistantMessages.length, assistantThinking]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // A Radix layer (drawer/dialog) owns Esc while open.
      if (document.querySelector('[role="dialog"][data-state="open"]')) return;
      closeAssistant();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAssistant]);

  const submit = () => {
    askAssistant(draft);
    setDraft("");
  };

  return (
    <div className={cn("glass-strong flex flex-col overflow-hidden rounded-xl", className)}>
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line/50 px-4">
        <span className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          <span className="text-[13px] font-semibold text-ink">{t("assistant.title")}</span>
          <span className="rounded-full border border-line px-1.5 py-px text-[9.5px] uppercase tracking-wide text-faint">
            {t("assistant.demoBrain")}
          </span>
        </span>
        <button
          onClick={closeAssistant}
          aria-label={t("assistant.close")}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-chip hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <div className="flex flex-col gap-3">
          {assistantMessages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m.id === "welcome" ? { ...m, text: t("assistant.welcome") } : m}
              animate={i === assistantMessages.length - 1 && m.role === "assistant" && m.id !== "welcome"}
              onCitation={(c) => {
                if (c.clusterId) selectCluster(c.clusterId);
              }}
              onChip={(chip) => askAssistant(chip)}
            />
          ))}
          {assistantThinking && (
            <div className="flex items-center gap-1.5 px-1 py-1 text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-livePulseFast rounded-full bg-current" />
              <span className="h-1.5 w-1.5 animate-livePulseFast rounded-full bg-current [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-livePulseFast rounded-full bg-current [animation-delay:300ms]" />
              <span className="ml-1 text-[11px]">{t("assistant.thinking")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex shrink-0 items-center gap-2 border-t border-line/50 p-3"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t("assistant.placeholder")}
          aria-label={t("sidebar.askSaarthi")}
          className="h-9 min-w-0 flex-1 rounded-full border border-input bg-surface/70 px-3.5 text-[12.5px] text-ink placeholder:text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
        <button
          type="submit"
          disabled={!draft.trim() || assistantThinking}
          aria-label={t("assistant.send")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  animate,
  onCitation,
  onChip,
}: {
  message: AssistantMessage;
  animate: boolean;
  onCitation: (c: AssistantCitation) => void;
  onChip: (chip: string) => void;
}) {
  const { t } = useI18n();
  const text = useStagedReveal(message.text, animate);
  const revealed = text.length >= message.text.length;

  if (message.role === "user") {
    return (
      <div className="self-end rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-[12.5px] leading-relaxed text-primary-foreground">
        {message.text}
      </div>
    );
  }

  return (
    <div className="max-w-full self-start">
      <div className="whitespace-pre-line rounded-2xl rounded-bl-md border border-line/60 bg-surface/85 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink">
        {text}
      </div>

      {revealed && message.citations && message.citations.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wide text-faint">{t("assistant.cited")}</span>
          {message.citations.map((c, i) =>
            c.clusterId ? (
              <button
                key={i}
                onClick={() => onCitation(c)}
                className="rounded-full border border-primary/35 px-2 py-0.5 text-[10.5px] font-medium text-primary hover:bg-primary/10"
              >
                {c.label}
              </button>
            ) : c.documentId ? (
              <Link
                key={i}
                href="/documents"
                className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10.5px] font-medium text-primary-link no-underline hover:bg-chip"
              >
                <FileText className="h-2.5 w-2.5" />
                {c.label}
              </Link>
            ) : c.href?.startsWith("/") ? (
              <Link
                key={i}
                href={c.href}
                className="rounded-full border border-line px-2 py-0.5 text-[10.5px] font-medium text-primary-link no-underline hover:bg-chip"
              >
                {c.label}
              </Link>
            ) : (
              <a
                key={i}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[10.5px] font-medium text-primary-link no-underline hover:bg-chip"
              >
                {c.label}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ),
          )}
        </div>
      )}

      {revealed && message.chips && message.chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {message.chips.map((chip) => (
            <button
              key={chip}
              onClick={() => onChip(chip)}
              className="rounded-full bg-chip px-2.5 py-1 text-[11px] text-body transition-colors hover:text-ink"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
