"use client";

import { useEffect, useState } from "react";
import {
  Accessibility,
  Contrast,
  ImageOff,
  Minus,
  MousePointer2,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ZOOM_STEPS, useA11yStore } from "@/lib/a11y-store";
import { speakPage, stopTts, ttsSupported } from "@/lib/a11y-tts";
import { cn } from "@/lib/utils";

/**
 * UX4G-style accessibility toolbar — a glass button in the top strip opening a
 * popover of assistive controls. Each setting persists and applies live via the
 * a11y store. Independent of the theme toggle.
 */
export function AccessibilityToolbar({ trigger }: { trigger?: React.ReactNode }) {
  const { t } = useI18n();
  const s = useA11yStore();
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
    const ok = speakPage(() => setSpeaking(false));
    setSpeaking(ok);
  }

  const scalePct = Math.round(ZOOM_STEPS[s.textScale]! * 100);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("a11y.title")}
            className={cn(
              "rounded-full text-muted-foreground hover:text-ink",
              !s.isDefault() && "text-primary",
            )}
          >
            <Accessibility className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-0 border-line/60 bg-surface p-0">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-line/60 px-4 py-3 text-left">
          <DialogTitle className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Accessibility className="h-4 w-4 text-primary" />
            {t("a11y.title")}
          </DialogTitle>
          {!s.isDefault() && (
            <button
              onClick={s.reset}
              className="mr-6 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-ink"
            >
              <RotateCcw className="h-3 w-3" />
              {t("a11y.reset")}
            </button>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-3 p-4">
          {/* Text size */}
          <Row label={t("a11y.textSize")}>
            <div className="flex items-center gap-1.5">
              <StepButton
                ariaLabel={t("a11y.textSmaller")}
                onClick={() => s.incTextScale(-1)}
                disabled={s.textScale === 0}
              >
                <Minus className="h-3.5 w-3.5" />
              </StepButton>
              <span className="num w-11 text-center text-[12px] font-medium tabular-nums text-ink">
                {scalePct}%
              </span>
              <StepButton
                ariaLabel={t("a11y.textLarger")}
                onClick={() => s.incTextScale(1)}
                disabled={s.textScale === ZOOM_STEPS.length - 1}
              >
                <Plus className="h-3.5 w-3.5" />
              </StepButton>
            </div>
          </Row>

          {/* Text spacing */}
          <Row label={t("a11y.spacing")}>
            <Segmented
              options={[
                { value: "normal", label: t("a11y.off") },
                { value: "wide", label: t("a11y.on") },
              ]}
              value={s.spacing}
              onChange={(v) => s.setSpacing(v as typeof s.spacing)}
            />
          </Row>

          {/* Line height */}
          <Row label={t("a11y.lineHeight")}>
            <Segmented
              options={[
                { value: "normal", label: t("a11y.off") },
                { value: "tall", label: t("a11y.on") },
              ]}
              value={s.lineHeight}
              onChange={(v) => s.setLineHeight(v as typeof s.lineHeight)}
            />
          </Row>

          {/* Toggles */}
          <ToggleRow
            icon={<Contrast className="h-4 w-4" />}
            label={t("a11y.highContrast")}
            active={s.contrast === "high"}
            onClick={() => s.setContrast(s.contrast === "high" ? "normal" : "high")}
          />
          <ToggleRow
            icon={<ImageOff className="h-4 w-4" />}
            label={t("a11y.hideImages")}
            active={s.hideImages}
            onClick={s.toggleHideImages}
          />
          <ToggleRow
            icon={<MousePointer2 className="h-4 w-4" />}
            label={t("a11y.bigCursor")}
            active={s.bigCursor}
            onClick={s.toggleBigCursor}
          />

          {/* Screen reader */}
          {supported && (
            <button
              onClick={toggleSpeak}
              className={cn(
                "mt-1 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-[12.5px] font-medium transition-colors",
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
      </DialogContent>
    </Dialog>
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

function ToggleRow({
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
    <button
      onClick={onClick}
      role="switch"
      aria-checked={active}
      className="flex items-center justify-between rounded-lg py-0.5 text-left"
    >
      <span className="flex items-center gap-2 text-[12.5px] text-body">
        <span className={cn(active ? "text-primary" : "text-muted-foreground")}>{icon}</span>
        {label}
      </span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          active ? "bg-primary" : "bg-line",
        )}
      >
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

function StepButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-body hover:border-line-dark disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-lg border border-line bg-panel p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
