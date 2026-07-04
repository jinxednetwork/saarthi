"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Globe,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Search,
  Send,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { BrandBars } from "@/components/icons";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
import { DASHBOARD_META, MOCK_CONSTITUENCY } from "@/lib/mock-data";

const MOBILE_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Intelligence", href: "/intelligence", icon: Sparkles },
  { label: "Live feed", href: "/live", icon: Radio },
  { label: "MPLADS", href: "/mplads", icon: IndianRupee },
  { label: "Actions", href: "/actions", icon: Send },
] as const;

/**
 * Floating glass strip over the content: mobile nav trigger, scope pill,
 * sync status, theme toggle, MP menu. Sits above the map on the dashboard and
 * above scrolling content elsewhere.
 */
export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-16 items-center gap-3 px-4">
      {/* Mobile nav */}
      <div className="pointer-events-auto lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation" className="glass rounded-full border-0">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetTitle className="flex items-center gap-3">
              <BrandBars />
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
                    {item.label}
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
        <span className="font-medium">Constituency</span>
        <span className="hidden text-faint sm:inline">{MOCK_CONSTITUENCY.name}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {/* Search stub */}
      <button
        className="glass pointer-events-auto hidden h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[12.5px] text-faint md:inline-flex"
        aria-label="Search (coming soon)"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>Search</span>
      </button>

      <div className="flex-1" />

      {/* Sync status */}
      <span className="glass pointer-events-auto hidden h-9 items-center gap-1.5 rounded-full px-3.5 text-xs text-muted-foreground xl:inline-flex">
        <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
        {DASHBOARD_META.syncedCopy}
      </span>

      <div className="glass pointer-events-auto flex h-9 items-center gap-0.5 rounded-full px-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex cursor-pointer items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-1.5"
              aria-label="MP account menu"
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
              <UserRound className="h-4 w-4" /> Profile · soon
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Settings className="h-4 w-4" /> Settings · soon
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <LogOut className="h-4 w-4" /> Sign out · soon
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
