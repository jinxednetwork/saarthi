"use client";

import { AccessibilityToolbar } from "@/components/a11y/AccessibilityToolbar";
import { useI18n } from "@/components/i18n/I18nProvider";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";
import { langMeta } from "@/lib/languages";

export function PortalHeader() {
  const { t, lang, translated } = useI18n();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line/60 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[480px] items-center gap-2 px-4">
          <BrandBars />
          <span className="flex items-baseline gap-1.5 leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-ink">Saarthi</span>
            <span className="hi text-[11px] text-faint">सारथि</span>
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <LanguagePicker />
            <AccessibilityToolbar />
          </div>
        </div>
      </header>
      {!translated && (
        <div className="border-b border-line/60 bg-chip/60 px-4 py-1.5 text-center text-[11px] text-muted-foreground">
          {t("lang.fallbackNotice", { language: langMeta(lang).english })}
        </div>
      )}
    </>
  );
}

function BrandBars() {
  return (
    <span className="flex h-7 w-7 items-end gap-[2px]" aria-hidden>
      {[10, 16, 12, 20].map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px]"
          style={{ height: h, background: i === 3 ? "hsl(var(--saffron))" : "hsl(var(--primary-brand))" }}
        />
      ))}
    </span>
  );
}
