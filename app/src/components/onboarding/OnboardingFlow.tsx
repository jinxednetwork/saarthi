"use client";

import { useEffect, useState } from "react";
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Check,
  Contrast,
  Languages,
  Sparkles,
  Type,
} from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useA11yStore } from "@/lib/a11y-store";
import { LANGUAGES } from "@/lib/languages";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";
import { isOnboarded, setOnboarded } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const TOTAL = 3;

/**
 * First-run onboarding — welcome → language → accessibility. Introduces the two
 * inclusivity levers (language picker + a11y toolbar) up front and writes both
 * stores as the MP chooses. Shown once ever; any close-path marks onboarded.
 */
export function OnboardingFlow() {
  const { t, lang, setLang } = useI18n();
  const a11y = useA11yStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOnboarded()) setOpen(true);
  }, []);

  function finish() {
    setOnboarded();
    setOpen(false);
  }

  const translated = LANGUAGES.filter((l) => l.translated);
  const largerOn = a11y.textScale > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) finish();
      }}
    >
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-[460px] gap-0 overflow-hidden border-line/60 bg-surface p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Progress */}
        <div className="flex items-center gap-1.5 px-6 pt-6">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-line",
              )}
            />
          ))}
        </div>

        <div className="px-6 pb-6 pt-5">
          {step === 0 && (
            <Step
              icon={<Sparkles className="h-5 w-5" />}
              title={t("onboarding.welcome.title")}
            >
              <p className="text-[14px] leading-relaxed text-body">
                {t("onboarding.welcome.body", { name: MOCK_CONSTITUENCY.mp.name })}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {t("onboarding.welcome.sub")}
              </p>
            </Step>
          )}

          {step === 1 && (
            <Step icon={<Languages className="h-5 w-5" />} title={t("onboarding.language.title")}>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t("onboarding.language.body")}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {translated.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3.5 py-3 text-left transition-colors",
                      lang === l.code
                        ? "border-primary bg-primary/10"
                        : "border-line hover:border-line-dark",
                    )}
                  >
                    <span>
                      <span
                        className={cn("block text-[14px] font-medium text-ink", l.code === "hi" && "hi")}
                      >
                        {l.endonym}
                      </span>
                      <span className="block text-[11px] text-faint">{l.english}</span>
                    </span>
                    {lang === l.code && <Check className="h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-faint">
                {t("onboarding.language.more", { count: LANGUAGES.length - translated.length })}
              </p>
            </Step>
          )}

          {step === 2 && (
            <Step icon={<Accessibility className="h-5 w-5" />} title={t("onboarding.a11y.title")}>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t("onboarding.a11y.body")}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <QuickToggle
                  icon={<Type className="h-4 w-4" />}
                  label={t("onboarding.a11y.largerText")}
                  active={largerOn}
                  onClick={() => a11y.incTextScale(largerOn ? -a11y.textScale : 1)}
                />
                <QuickToggle
                  icon={<Contrast className="h-4 w-4" />}
                  label={t("a11y.highContrast")}
                  active={a11y.contrast === "high"}
                  onClick={() => a11y.setContrast(a11y.contrast === "high" ? "normal" : "high")}
                />
              </div>
              <p className="mt-3 text-[11.5px] text-faint">{t("onboarding.a11y.more")}</p>
            </Step>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line/60 bg-panel/50 px-6 py-4">
          {step > 0 ? (
            <Button variant="ghost" className="rounded-full" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("onboarding.back")}
            </Button>
          ) : (
            <button
              onClick={finish}
              className="text-[12.5px] font-medium text-muted-foreground hover:text-ink"
            >
              {t("onboarding.skip")}
            </button>
          )}

          {step < TOTAL - 1 ? (
            <Button className="rounded-full" onClick={() => setStep((s) => s + 1)}>
              {t("onboarding.next")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button className="rounded-full" onClick={finish}>
              {t("onboarding.finish")}
              <Check className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <DialogTitle className="mb-2 text-[19px] font-semibold leading-tight text-ink">
        {title}
      </DialogTitle>
      {children}
    </div>
  );
}

function QuickToggle({
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
      className={cn(
        "flex items-center justify-between rounded-xl border px-3.5 py-3 transition-colors",
        active ? "border-primary bg-primary/10" : "border-line hover:border-line-dark",
      )}
    >
      <span className="flex items-center gap-2.5 text-[13.5px] text-body">
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
