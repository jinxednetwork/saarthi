import type { CrossReference } from "@saarthi/shared";

/** Cross-reference narrative + dataset citation links (the "collision" layer). */
export function CrossRefs({
  prose,
  refs,
}: {
  prose?: string;
  refs: CrossReference[];
}) {
  if (!prose && refs.length === 0) return null;
  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-faint">
        Cross-reference · public data
      </div>
      {prose && <p className="text-[12.5px] leading-relaxed text-ink">{prose}</p>}
      {refs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1">
          {refs.map((s, i) => (
            <a
              key={i}
              href={s.citation_url}
              className="text-[11px] font-medium text-primary-link no-underline hover:underline"
            >
              {s.dataset} · {s.metric}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
