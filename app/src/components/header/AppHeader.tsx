import Link from "next/link";
import { BrandBars, ChevronDown, GlobeIcon } from "@/components/icons";
import { MOCK_CONSTITUENCY } from "@/lib/mock-data";

export type NavPage = "dashboard" | "intelligence" | "live" | "mplads" | "actions";

const NAV: { key: NavPage; label: string; href: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard" },
  { key: "intelligence", label: "Intelligence", href: "/intelligence" },
  { key: "live", label: "Live feed", href: "#" },
  { key: "mplads", label: "MPLADS", href: "#" },
  { key: "actions", label: "Actions", href: "#" },
];

/**
 * Top navigation + quiet sub-context strip, shared across screens (design:
 * identical header structure on Dashboard/Intelligence). Each page supplies its
 * sub-strip: a title, a context line, and a right-hand status line.
 */
export function AppHeader({
  active,
  title,
  context,
  status,
}: {
  active: NavPage;
  title: string;
  context: string;
  status: string;
}) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-9 px-10">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-[11px] no-underline">
          <BrandBars />
          <span className="flex items-baseline gap-2 leading-none">
            <span className="text-[19px] font-semibold tracking-tight text-primary">Saarthi</span>
            <span className="hi text-[13px] text-faint">सारथि</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="ml-2 flex h-[68px] items-center gap-1 self-start">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={item.key === active ? "page" : undefined}
              className={`relative flex h-full items-center px-3 text-[13.5px] no-underline ${
                item.key === active
                  ? "font-medium text-ink"
                  : "font-normal text-body hover:text-ink"
              }`}
            >
              {item.label}
              {item.key === active && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-[1px] bg-primary" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Scope pill */}
        <button className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-transparent px-3 py-[7px] text-[12.5px] text-ink hover:border-line-dark">
          <span className="text-muted">
            <GlobeIcon />
          </span>
          <span className="font-medium">Constituency</span>
          <span className="text-faint">{MOCK_CONSTITUENCY.name}</span>
          <span className="text-muted">
            <ChevronDown />
          </span>
        </button>

        {/* MP identity */}
        <button className="flex cursor-pointer items-center gap-2.5 rounded-full border-0 bg-transparent py-1 pl-1.5 pr-1 hover:bg-chip">
          <span
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[12.5px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #12325B, #054A91)" }}
          >
            BS
          </span>
          <span className="text-muted">
            <ChevronDown size={12} />
          </span>
        </button>
      </div>

      {/* Sub-context strip */}
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 pb-3.5 text-xs text-muted">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-semibold tracking-tight text-ink">{title}</span>
          <span className="text-faint">·</span>
          <span>{context}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-[5px] w-[5px] animate-livePulse rounded-full bg-success" />
          <span>{status}</span>
        </div>
      </div>
    </header>
  );
}
