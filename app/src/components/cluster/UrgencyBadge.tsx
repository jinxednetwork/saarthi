import type { Urgency } from "@saarthi/shared";
import { URGENCY_UI } from "@/lib/ui";

/** Border-only urgency pill, or the green "In progress" variant when dispatched. */
export function UrgencyBadge({
  urgency,
  dispatched = false,
}: {
  urgency: Urgency;
  dispatched?: boolean;
}) {
  const u = URGENCY_UI[urgency];
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
      style={
        dispatched
          ? { color: "hsl(var(--success))", borderColor: "hsl(var(--success) / 0.35)" }
          : { color: u.text, borderColor: u.border }
      }
    >
      {dispatched ? "In progress" : u.label}
    </span>
  );
}
