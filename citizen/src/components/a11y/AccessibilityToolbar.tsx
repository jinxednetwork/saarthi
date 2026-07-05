"use client";

import { useEffect, useState } from "react";
import {
  Accessibility,
  Contrast,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useA11y } from "./A11yProvider";
import { ZOOM_STEPS } from "@/lib/a11y";
import { speakPage, stopTts, ttsSupported } from "@/lib/a11y-tts";
import { cn } from "@/lib/utils";

/** Compact accessibility panel — same controls as the dashboard, portal-sized. */
export function AccessibilityToolbar() {
  const { t } = useI18n();
  const a = useA11y();
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(ttsSupported());
    return () => stopTts();
  }, []);

  function toggleSpeak() {
    if (speaking) {
      stopTts();
      setSpeaking(false);
      return;
    }
    setSpeaking(speakPage(() => setSpeaking(false)));
  }

  const scalePct = Math.round(ZOOM_STEPS[a.textScale]! * 100);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("a11y.title")}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-chip hover:text-ink",
          !a.isDefault && "text-primary",
        )}
      >
        <Accessibility className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-16"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[320px] overflow-hidden rounded-xl border border-line/60 bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line/60 px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Accessibility className="h-4 w-4 text-primary" />
                {t("a11y.title")}
              </span>
              <div className="flex items-center gap-2">
                {!a.isDefault && (
                  <button
                    onClick={a.reset}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-ink"
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t("a11y.reset")}
                  </button>
                )}
                <button onClick={() => setOpen(false)} aria-label={t("a11y.close")}>
                  <X className="h-4 w-4 text-muted-foreground hover:text-ink" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-4">
              <Row label={t("a11y.textSize")}>
                <div className="flex items-center gap-1.5">
                  <Step aria={t("a11y.smaller")} onClick={() => a.incTextScale(-1)} disabled={a.textScale === 0}>
                    <Minus className="h-3.5 w-3.5" />
                  </Step>
                  <span className="w-11 text-center text-[12px] font-medium tabular-nums text-ink">
                    {scalePct}%
                  </span>
                  <Step
                    aria={t("a11y.larger")}
                    onClick={() => a.incTextScale(1)}
                    disabled={a.textScale === ZOOM_STEPS.length - 1}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Step>
                </div>
              </Row>

              <Row label={t("a11y.spacing")}>
                <Segmented
                  on={a.spacing === "wide"}
                  onChange={(v) => a.setSpacing(v ? "wide" : "normal")}
                  onLabel={t("a11y.on")}
                  offLabel={t("a11y.off")}
                />
              </Row>
              <Row label={t("a11y.lineHeight")}>
                <Segmented
                  on={a.lineHeight === "tall"}
                  onChange={(v) => a.setLineHeight(v ? "tall" : "normal")}
                  onLabel={t("a11y.on")}
                  offLabel={t("a11y.off")}
                />
              </Row>

              <Toggle
                icon={<Contrast className="h-4 w-4" />}
                label={t("a11y.highContrast")}
                active={a.contrast === "high"}
                onClick={() => a.setContrast(a.contrast === "high" ? "normal" : "high")}
              />
              <Toggle
                icon={<MousePointer2 className="h-4 w-4" />}
                label={t("a11y.bigCursor")}
                active={a.bigCursor}
                onClick={a.toggleBigCursor}
              />

              {supported && (
                <button
                  onClick={toggleSpeak}
                  className={cn(
                    "mt-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-[12.5px] font-medium",
                    speaking
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-line bg-panel text-body hover:border-line-dark",
                  )}
                >
                  {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {speaking ? t("a11y.stopReading") : t("a11y.readPage")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] text-body">{label}</span>
      {children}
    </div>
  );
}

function Step({
  children,
  onClick,
  disabled,
  aria,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  aria: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-body hover:border-line-dark disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Segmented({
  on,
  onChange,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <div className="flex gap-0.5 rounded-lg border border-line bg-panel p-0.5">
      {[
        { v: false, l: offLabel },
        { v: true, l: onLabel },
      ].map((o) => (
        <button
          key={o.l}
          onClick={() => onChange(o.v)}
          aria-pressed={on === o.v}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11.5px] font-medium",
            on === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-ink",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} role="switch" aria-checked={active} className="flex items-center justify-between py-0.5 text-left">
      <span className="flex items-center gap-2 text-[12.5px] text-body">
        <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        {label}
      </span>
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full", active ? "bg-primary" : "bg-line")}>
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-surface transition-transform",
            active ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
