import type { ActionStatus } from "@saarthi/shared";

const STEPS: { key: ActionStatus; label: string }[] = [
  { key: "draft", label: "Drafted" },
  { key: "sent", label: "Dispatched" },
  { key: "responded", label: "Responded" },
  { key: "completed", label: "Completed" },
];

/** Compact 4-step stepper: draft → sent → responded → completed. */
export function ActionTimeline({ status }: { status: ActionStatus }) {
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${done ? "bg-success" : "bg-line"}`}
                aria-hidden
              />
              <span className={`text-[9px] ${done ? "text-body" : "text-faint"}`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={`mx-1 mb-3.5 h-px w-5 ${i < currentIdx ? "bg-success" : "bg-line"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
