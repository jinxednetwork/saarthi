"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  IndianRupee,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
  Send,
  Sparkles,
} from "lucide-react";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { BrandBars } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardStore } from "@/lib/dashboard-store";
import { cn } from "@/lib/utils";

const NAV = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "intelligence", label: "Intelligence", href: "/intelligence", icon: Sparkles },
  { key: "live", label: "Live feed", href: "/live", icon: Radio },
  { key: "mplads", label: "MPLADS", href: null, icon: IndianRupee },
  { key: "actions", label: "Actions", href: null, icon: Send },
] as const;

/**
 * Collapsible glass rail (232px ↔ 64px). Unbuilt destinations render disabled
 * with a "Soon" hint — no dead links. Collapse state persists to localStorage.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarCollapsed, toggleSidebar } = useDashboardStore();

  useEffect(() => {
    try {
      if (localStorage.getItem("saarthi-sidebar") === "1") setSidebarCollapsed(true);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          "glass-strong relative z-40 hidden h-full shrink-0 flex-col border-y-0 border-l-0 transition-[width] duration-300 ease-out lg:flex",
          sidebarCollapsed ? "w-16" : "w-[232px]",
        )}
      >
        {/* Brand */}
        <Link
          href="/dashboard"
          className={cn(
            "flex h-16 items-center gap-3 border-b border-line/60 px-5 no-underline",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          <BrandBars />
          {!sidebarCollapsed && (
            <span className="flex items-baseline gap-2 leading-none">
              <span className="text-[17px] font-semibold tracking-tight text-ink">Saarthi</span>
              <span className="hi text-xs text-faint">सारथि</span>
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
          {NAV.map((item) => {
            const active = item.href != null && pathname.startsWith(item.href);
            const Icon = item.icon;
            const inner = (
              <>
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                {!sidebarCollapsed && (
                  <span className="flex-1 truncate text-[13.5px]">{item.label}</span>
                )}
                {!sidebarCollapsed && item.href == null && (
                  <span className="rounded-full border border-line px-1.5 py-px text-[10px] uppercase tracking-wide text-faint">
                    Soon
                  </span>
                )}
              </>
            );
            const classes = cn(
              "flex h-10 items-center gap-3 rounded-lg px-3 no-underline transition-colors",
              sidebarCollapsed && "justify-center px-0",
              active
                ? "bg-primary/15 font-medium text-primary"
                : item.href
                  ? "text-body hover:bg-chip hover:text-ink"
                  : "cursor-default text-faint",
            );

            const node =
              item.href != null ? (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={classes}
                >
                  {inner}
                </Link>
              ) : (
                <span key={item.key} className={classes} aria-disabled="true">
                  {inner}
                </span>
              );

            return sidebarCollapsed ? (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>{node}</TooltipTrigger>
                <TooltipContent side="right">
                  {item.label}
                  {item.href == null ? " · soon" : ""}
                </TooltipContent>
              </Tooltip>
            ) : (
              node
            );
          })}

          <div className="mt-auto">
            <AssistantLauncher collapsed={sidebarCollapsed} />
          </div>
        </nav>

        {/* MP identity + collapse */}
        <div
          className={cn(
            "flex items-center gap-3 border-t border-line/60 p-3",
            sidebarCollapsed && "flex-col",
          )}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #12325B, #054A91)" }}
            aria-hidden
          >
            BS
          </span>
          {!sidebarCollapsed && (
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-medium text-ink">
                Bansuri Swaraj
              </span>
              <span className="block truncate text-[11px] text-faint">MP · New Delhi</span>
            </span>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-chip hover:text-ink"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
