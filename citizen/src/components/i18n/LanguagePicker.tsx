"use client";

import { useState } from "react";
import { Check, Languages, X } from "lucide-react";
import { useI18n } from "./I18nProvider";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

/** All 22 scheduled languages + English; EN/HI translated, rest fall back. */
export function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={t("lang.title")}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-chip hover:text-ink"
      >
        <Languages className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-4 pt-12"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-[520px] flex-col overflow-hidden rounded-xl border border-line/60 bg-surface shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-line/60 px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">{t("lang.picker.title")}</h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{t("lang.picker.subtitle")}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label={t("a11y.close")}>
                <X className="h-4 w-4 text-muted-foreground hover:text-ink" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto p-4 sm:grid-cols-3">
              {LANGUAGES.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    dir={l.dir}
                    aria-pressed={active}
                    className={cn(
                      "relative flex flex-col rounded-lg border px-3 py-2.5 text-start",
                      active ? "border-primary bg-primary/10" : "border-line hover:border-line-dark hover:bg-chip/50",
                    )}
                  >
                    <span className="text-[14px] font-medium text-ink">{l.endonym}</span>
                    <span className="text-[11px] text-muted-foreground">{l.english}</span>
                    {!l.translated && (
                      <span className="mt-1 text-[9.5px] uppercase tracking-wide text-faint">
                        {t("lang.inProgress")}
                      </span>
                    )}
                    {active && <Check className="absolute end-2 top-2 h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
