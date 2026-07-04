"use client";

import { Check, Languages } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

/**
 * UX4G-style language picker — all 22 scheduled languages + English, each shown
 * in its own script (endonym) with the English name beneath. English & Hindi are
 * fully translated; the rest are labelled "in progress" and fall back to English.
 */
export function LanguagePicker({ trigger }: { trigger?: React.ReactNode }) {
  const { lang, setLang, t } = useI18n();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="icon"
            aria-label={t("topbar.language")}
            className="glass h-9 w-9 rounded-full border-0 text-muted-foreground hover:text-ink"
          >
            <Languages className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-[560px] overflow-hidden border-line/60 bg-surface">
        <DialogHeader>
          <DialogTitle>{t("lang.picker.title")}</DialogTitle>
          <DialogDescription>{t("lang.picker.subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[56vh] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
          {LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                dir={l.dir}
                aria-pressed={active}
                className={cn(
                  "relative flex flex-col rounded-lg border px-3 py-2.5 text-start transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-line hover:border-line-dark hover:bg-chip/50",
                )}
              >
                <span className="text-[14px] font-medium text-ink">{l.endonym}</span>
                <span className="text-[11px] text-muted-foreground">{l.english}</span>
                {!l.translated && (
                  <span className="mt-1 text-[9.5px] uppercase tracking-wide text-faint">
                    {t("lang.inProgress")}
                  </span>
                )}
                {active && (
                  <Check className="absolute end-2 top-2 h-3.5 w-3.5 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
