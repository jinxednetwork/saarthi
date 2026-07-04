"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

/**
 * Shared page header for scrolling routes. Titles/subtitles come from i18n keys
 * (client-resolved so server pages can stay server components); pass a raw
 * `subtitle` only for dynamic/data-derived text.
 */
export function PageHeader({
  titleKey,
  subtitleKey,
  subtitle,
  right,
}: {
  titleKey: string;
  subtitleKey?: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const { t } = useI18n();
  const sub = subtitleKey ? t(subtitleKey) : subtitle;
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
      <div className="flex items-baseline gap-2">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{t(titleKey)}</h1>
        {sub && (
          <>
            <span className="text-faint">·</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
          </>
        )}
      </div>
      {right}
    </div>
  );
}
