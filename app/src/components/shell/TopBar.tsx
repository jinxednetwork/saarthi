"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Globe,
  FileText,
  IndianRupee,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Radio,
  Send,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AccessibilityToolbar } from "@/components/a11y/AccessibilityToolbar";
import { useI18n } from "@/components/i18n/I18nProvider";
import { LanguagePicker } from "@/components/i18n/LanguagePicker";
import { BrandMark } from "@/components/icons";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { langMeta } from "@/lib/languages";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";

const MOBILE_NAV = [
  { key: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "nav.intelligence", href: "/intelligence", icon: Sparkles },
  { key: "nav.proposals", href: "/proposals", icon: ListChecks },
  { key: "nav.live", href: "/live", icon: Radio },
  { key: "nav.mplads", href: "/mplads", icon: IndianRupee },
  { key: "nav.actions", href: "/actions", icon: Send },
  { key: "nav.documents", href: "/documents", icon: FileText },
] as const;

/**
 * Floating glass strip over the content: mobile nav trigger, scope pill,
 * sync status, theme toggle, MP menu. Sits above the map on the dashboard and
 * above scrolling content elsewhere.
 */
export function TopBar() {
  const pathname = usePathname();
  const { t, lang, translated, machine } = useI18n();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-16 items-center gap-3 px-4">
      {/* Mobile nav */}
      <div className="pointer-events-auto lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label={t("topbar.openNav")} className="glass rounded-full border-0">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetTitle className="flex items-center gap-3">
              <BrandMark />
              <span className="text-[17px] font-semibold tracking-tight text-ink">Saarthi</span>
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-1" aria-label="Primary">
              {MOBILE_NAV.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 items-center gap-3 rounded-lg px-3 text-[13.5px] no-underline ${
                      active ? "bg-primary/15 font-medium text-primary" : "text-body"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Scope pill */}
      <button className="glass pointer-events-auto inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[12.5px] text-ink hover:border-line-dark">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
        <span className="font-medium">{t("topbar.constituency")}</span>
        <span className="hidden text-faint sm:inline">{MOCK_CONSTITUENCY.name}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Language notice — machine-assisted, or English fallback when untranslated */}
      {(machine || !translated) && (
        <span className="glass pointer-events-auto hidden h-9 items-center rounded-full px-3 text-[11px] text-muted-foreground lg:inline-flex">
          {machine
            ? t("lang.machineNotice", { language: langMeta(lang).english })
            : t("lang.fallbackNotice", { language: langMeta(lang).english })}
        </span>
      )}

      <div className="flex-1" />

      {/* Sync status */}
      <span className="glass pointer-events-auto hidden h-9 items-center gap-1.5 rounded-full px-3.5 text-xs text-muted-foreground xl:inline-flex">
        <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
        {t("topbar.synced", { time: "12:47 PM", week: 44 })}
      </span>

      <div className="glass pointer-events-auto flex h-9 items-center gap-0.5 rounded-full px-1">
        <AccessibilityToolbar />
        <LanguagePicker />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex cursor-pointer items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-1.5"
              aria-label={t("topbar.profile")}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #12325B, #054A91)" }}
              >
                BS
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-[13px] font-medium">Hon&rsquo;ble Bansuri Swaraj</span>
              <span className="block text-[11px] font-normal text-faint">
                MP · New Delhi Lok Sabha
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserRound className="h-4 w-4" /> {t("topbar.profile")} · {t("nav.soon")}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="h-4 w-4" /> {t("topbar.settings")} · {t("nav.soon")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="h-4 w-4" /> {t("topbar.signout")} · {t("nav.soon")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
