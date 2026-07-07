"use client";

import { MapPin } from "lucide-react";
import { CategoryIcon } from "@/components/icons";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { groupColor } from "@/lib/categories";
import { useDashboardStore } from "@/lib/dashboard-store";

/**
 * Citizen ticket detail drawer — opened from Live Signals feed rows for
 * portal submissions that haven't joined a cluster yet. Sibling to
 * ClusterDrawer, not a variant of it: a ticket has no urgency, dispatch, or
 * MPLADS action, so it gets its own small Sheet rather than a branchy shared one.
 */
export function TicketDrawer() {
  const { selectedTicketId, citizenTickets, closeTicketDetail } = useDashboardStore();
  const ticket = citizenTickets.find((t) => t.id === selectedTicketId);

  return (
    <Sheet open={ticket != null} onOpenChange={(open) => !open && closeTicketDetail()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-line/60 bg-surface p-0 sm:w-[460px] sm:max-w-[460px]"
      >
        {ticket && (
          <div className="flex flex-col gap-4 px-5 py-5">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `${groupColor(ticket.category)}1f`,
                  color: groupColor(ticket.category),
                }}
              >
                <CategoryIcon category={ticket.category} />
              </span>
              <SheetTitle className="text-lg font-semibold leading-snug tracking-tight text-ink">
                {ticket.categoryLabel}
              </SheetTitle>
            </div>
            <SheetDescription className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {ticket.wardName}
            </SheetDescription>

            <p className="text-[13px] leading-relaxed text-ink">{ticket.description}</p>

            {ticket.photoInsight && (
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                📷 AI read the photo: {ticket.photoInsight}
              </p>
            )}
            {ticket.voiceTranscript && (
              <p className="text-[12px] leading-relaxed text-muted-foreground">
                🎙 Transcript: “{ticket.voiceTranscript}”
              </p>
            )}

            {ticket.lat != null && ticket.lng != null && (
              <a
                href={`https://www.google.com/maps?q=${ticket.lat},${ticket.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-1 text-[12px] font-medium text-primary hover:underline"
              >
                <MapPin className="h-3 w-3" />
                {ticket.lat.toFixed(5)}, {ticket.lng.toFixed(5)} · View on map
              </a>
            )}

            <div className="border-t border-line/60 pt-3 text-[11px] text-faint">
              {ticket.id} · {ticket.status} · {ticket.phoneMasked}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
