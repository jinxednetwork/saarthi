/** Shared page header for scrolling routes (mplads / actions / intelligence). */
export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
      <div className="flex items-baseline gap-2">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && (
          <>
            <span className="text-faint">·</span>
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          </>
        )}
      </div>
      {right}
    </div>
  );
}
