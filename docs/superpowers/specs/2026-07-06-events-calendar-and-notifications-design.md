# Events Calendar & Notification Panel — Design

**Date:** 2026-07-06
**Status:** Approved, ready for implementation planning

## Problem

MPs juggle rallies, campaign appearances, and parliament sessions alongside the
core Saarthi loop (intake → cluster → rank → action). There's currently no
place to see "where do I need to be and when." Separately, there's no way for
an MP to get a quick pulse of what needs attention across the app (overdue
actions, high-severity clusters, upcoming events) without visiting each page.

This design adds two small, related features:

1. An **Events Calendar** — a new top-level page for scheduling and viewing
   rallies, campaigns, parliament sessions, and public appearances.
2. A **Notification panel** — a bell icon in the top bar that surfaces a
   computed feed of reminders and alerts drawn from the calendar and existing
   data (Actions Tracker, intelligence clusters).

Both are scoped as v1/hackathon features: offline-first, consistent with the
rest of the app's `SAARTHI_MODE=emulator` + mock-data approach. Neither
requires new backend infrastructure beyond a new Firestore collection for
events.

## Non-goals

- No overlap with the existing Actions Tracker. MEETING-type actions stay
  exactly where they are; the calendar is a separate concept (confirmed with
  user).
- No live government API integration for parliament session dates — seeded as
  static demo data, same as the rest of the app's demo dataset.
- No persisted notification entity or backend write-triggers. Notifications
  are computed client-side from existing data, not stored server-side.
- No reminder delivery outside the in-app panel (no email/push/SMS).

## Part 1: Events Calendar

### Data model

New shared type, `packages/shared/src/types/event.ts`:

- `id: string`
- `title: string`
- `type: 'rally' | 'campaign' | 'parliament_session' | 'public_appearance' | 'other'`
- `start_time: string` (ISO)
- `end_time?: string` (ISO)
- `location?: string`
- `description?: string`
- `created_by: string` (user id)
- `status: 'scheduled' | 'cancelled'`
- constituency scope field, following whatever pattern existing shared types
  (e.g. `Action`) use for RBAC/constituency scoping

Persisted in a new Firestore collection (`events`), following the existing
pattern of one canonical shape in `packages/shared` imported by app/worker/functions.

### Permissions

Only `mp` and `chief_of_staff` roles can create, edit, or cancel events. All
other roles (including `constituency_coordinator`, `field_worker`,
`communications`, `observer`) have read-only access to the calendar.

### UI

- New route: `app/src/app/(dashboard)/events/page.tsx`.
- New top-level sidebar entry ("Events") in `Sidebar.tsx`, alongside
  Dashboard, Intelligence, Actions, Documents, MPLADS, Proposals.
- Primary view: month-grid calendar, built on the shadcn `Calendar` primitive
  (`react-day-picker`), added to `app/src/components/ui/` alongside the other
  shadcn primitives already in use.
- Each day with events shows a colored dot per event type. Color mapping
  follows `DESIGN.md`'s "Meaning-Locked Colour" rule (a type always maps to
  the same color everywhere it appears).
- Clicking a day opens an agenda list for that day in a side panel/drawer.
- "Add Event" button opens a modal form; visible/enabled only for `mp` and
  `chief_of_staff` sessions, hidden or disabled for other roles.

### Seed data

Extend the existing `pnpm seed:demo` script to generate:
- A small static list of Lok Sabha sitting dates (parliament sessions) as
  demo data — hard-coded, not fetched live.
- A handful of demo rally/campaign/public-appearance events around the demo
  persona (MP Bansuri Swaraj, New Delhi).

## Part 2: Notification Panel

### Aggregation approach

No new persisted notification entity. A hook (e.g.
`app/src/hooks/useNotifications.ts`) computes a unified notification list at
render time from three existing/adjacent sources:

1. **Event reminders** — Events (Part 1) starting within a lead-time window
   (default 48h) generate a reminder, e.g. "Rally tomorrow at 4pm."
2. **Actions alerts** — Actions (existing `Action` shared type) whose response
   countdown has passed deadline, or whose status just changed (e.g. →
   `responded`), generate an alert.
3. **Intelligence/cluster alerts** — high-severity issue clusters from the
   existing intelligence/clusters data generate an alert.

The notification item shape is an **app-local type**, not added to
`packages/shared` — it's a derived view model over already-persisted shapes,
not a new Firestore/BigQuery document, so it falls outside the shared-package
anti-drift rule (which governs persisted document shapes).

### UI

- Bell icon added to the existing icon cluster in `TopBar.tsx` (alongside
  `AccessibilityToolbar`, `LanguagePicker`, `ThemeToggle`), with an
  unread-count badge.
- Clicking opens a dropdown panel listing notifications, most urgent/recent
  first, grouped or labeled by source.
- Each notification deep-links to its source: the event's day on the
  calendar, the action's row in the Actions Tracker, or the cluster's detail
  view.
- "Mark all read" clears the badge.

### State

Read/dismissed state is stored client-side in the existing `useDashboardStore`
Zustand pattern (persisted to localStorage) — consistent with how the rest of
the dashboard's ephemeral UI state works. No backend write path needed.

## Reuse notes for implementation

- Follow `ActionsLedger` / `ActionTimeline` (`app/src/components/actions/`)
  as the closest existing precedent for a timeline/status-driven list UI.
- Follow existing shadcn primitive conventions in `app/src/components/ui/`
  when adding the `Calendar` component.
- Follow `packages/shared/src/types/action.ts` as the closest precedent for
  the new `Event` shape (scoping fields, id conventions).
- Follow `packages/shared/src/types/user.ts`'s `NotificationPrefs` for how
  user-level notification settings are already modeled, in case the
  notification panel should respect `urgent_alerts`/`email_digest` prefs
  later (out of scope for v1, but avoid conflicting with it).
