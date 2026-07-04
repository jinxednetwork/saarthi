import type { Category, SubmissionSource } from "@saarthi/shared";

/** Feather-style inline icons ported from the design (`_sourceIcon`, `_categoryIcon`). */

function Svg({
  size = 12,
  strokeWidth = 1.75,
  children,
}: {
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="block"
    >
      {children}
    </svg>
  );
}

export function SourceIcon({ source, size = 12 }: { source: SubmissionSource | "action"; size?: number }) {
  switch (source) {
    case "whatsapp":
      return (
        <Svg size={size}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </Svg>
      );
    case "twitter":
      return (
        <Svg size={size}>
          <line x1={4} y1={4} x2={20} y2={20} />
          <line x1={4} y1={20} x2={20} y2={4} />
        </Svg>
      );
    case "reddit":
      return (
        <Svg size={size}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      );
    case "portal":
    case "widget":
      return (
        <Svg size={size}>
          <rect x={3} y={4} width={18} height={16} rx={1} />
          <line x1={3} y1={9} x2={21} y2={9} />
          <circle cx={7} cy={6.5} r={0.5} fill="currentColor" />
          <circle cx={9.5} cy={6.5} r={0.5} fill="currentColor" />
        </Svg>
      );
    case "news":
      return (
        <Svg size={size}>
          <path d="M4 4h12v16H4z" />
          <line x1={16} y1={8} x2={20} y2={8} />
          <line x1={16} y1={12} x2={20} y2={12} />
          <line x1={16} y1={16} x2={20} y2={16} />
          <line x1={7} y1={8} x2={13} y2={8} />
          <line x1={7} y1={12} x2={13} y2={12} />
          <line x1={7} y1={16} x2={13} y2={16} />
        </Svg>
      );
    case "action":
      return (
        <Svg size={size} strokeWidth={2}>
          <line x1={22} y1={2} x2={11} y2={13} />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </Svg>
      );
    default:
      return (
        <Svg size={size}>
          <circle cx={12} cy={12} r={6} />
        </Svg>
      );
  }
}

export function CategoryIcon({ category, size = 14 }: { category: Category; size?: number }) {
  switch (category) {
    case "infrastructure":
    case "other":
      return (
        <Svg size={size}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-4h6v4" />
          <path d="M9 12h.01M12 12h.01M15 12h.01M9 8h.01M12 8h.01M15 8h.01" />
        </Svg>
      );
    case "water":
      return (
        <Svg size={size}>
          <path d="M12 2s-6 8-6 12a6 6 0 0 0 12 0c0-4-6-12-6-12z" />
        </Svg>
      );
    case "health":
    case "air_quality":
      return (
        <Svg size={size}>
          <path d="M3 12h4l2-6 4 12 2-6h6" />
        </Svg>
      );
  }
}

export function ChevronRight({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size}>
      <polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

export function ChevronDown({ size = 10 }: { size?: number }) {
  return (
    <Svg size={size}>
      <polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

export function GlobeIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx={12} cy={12} r={9} />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
    </Svg>
  );
}

export function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </Svg>
  );
}

export function ArrowRight({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size}>
      <line x1={5} y1={12} x2={19} y2={12} />
      <polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

export function MoreIcon({ size = 16 }: { size?: number }) {
  return (
    <Svg size={size}>
      <circle cx={12} cy={12} r={1.5} />
      <circle cx={19} cy={12} r={1.5} />
      <circle cx={5} cy={12} r={1.5} />
    </Svg>
  );
}

export function SendIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <line x1={22} y1={2} x2={11} y2={13} />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </Svg>
  );
}

export function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Svg>
  );
}

export function CitationsIcon({ size = 10 }: { size?: number }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c-2.21 0-4-4.03-4-9s1.79-9 4-9m0 18c2.21 0 4-4.03 4-9s-1.79-9-4-9m0 0a9 9 0 0 0-9 9" />
    </Svg>
  );
}

/** The Saarthi brand mark — staggered signal bars. */
export function BrandBars({ scale = 1 }: { scale?: number }) {
  const bars = [
    { h: 9, c: "hsl(var(--primary-brand))" },
    { h: 16, c: "hsl(var(--primary-brand))" },
    { h: 13, c: "hsl(var(--primary-brand))" },
    { h: 20, c: "hsl(var(--saffron))" },
    { h: 11, c: "hsl(var(--primary-brand))" },
  ];
  return (
    <div className="flex items-end" style={{ gap: 2 * scale, height: 22 * scale }}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            width: 3 * scale,
            height: b.h * scale,
            background: b.c,
            borderRadius: 1 * scale,
          }}
        />
      ))}
    </div>
  );
}
