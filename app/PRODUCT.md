# Product

## Register

product

## Users

Members of Parliament and their office staff (six roles: MP, chief of staff,
constituency coordinator, field worker, communications, observer). The MP's
context: Monday morning, minutes between meetings, deciding what deserves
attention this week. Staff context: triaging citizen signals, drafting letters,
verifying issues on the ground. Many staff are more comfortable in Hindi than
English — the Hindi UI is first-class, not a translation afterthought. The job
to be done: *know what requires attention, what changed, what's escalating, and
what action to take — in minutes, not hours.*

## Product Purpose

Saarthi (सारथि — "charioteer") is an AI executive-intelligence platform for
India's MPs. It ingests fragmented civic signals (WhatsApp, X, Reddit, web
widget, news, documents), clusters them semantically, cross-references public
government datasets, ranks issues by demand + severity + MPLADS-compliance
leverage, and produces briefings, a cited Q&A assistant, and one-click outputs
(MPLADS letters, PDFs, decks). Success: a non-technical user grasps the top
issues in five minutes, and every AI claim is traceable to its evidence.
Built for the "Build with AI: Code for Communities" hackathon (Google Cloud);
demo persona is MP Bansuri Swaraj, New Delhi Lok Sabha.

## Brand Personality

**Sober · Evidentiary · Assured.** A civil-service instrument, not a startup
dashboard: calm authority, every claim cited, numbers treated with respect
(tabular numerals, Indian formatting — ₹1,00,000). The interface should feel
like a trusted senior aide handing over a perfectly prepared briefing — quiet
confidence, zero theatrics. Bilingual dignity: Devanagari is set with the same
care as Latin.

## Anti-references

- **Generic SaaS admin template** — Bootstrap/Tailwind-UI dashboard sameness:
  identical stat cards, blue-purple gradients, rounded-everything.
- **Flashy consumer app** — playful gradients, mascots, confetti, marketing
  energy. Wrong for a decision-maker's instrument.
- **Dated gov portal (NIC-style)** — dense link lists, beveled buttons, no
  hierarchy. UX4G exists to escape this; Saarthi must never regress to it.
- **Bloomberg-terminal density** — everything-at-once data walls. Saarthi's job
  is triage, not exhaustive display.

## Design Principles

1. **Evidence before assertion.** Every ranked issue, recommendation, and
   generated letter shows its sources inline. If it can't be cited, it isn't
   shown.
2. **Triage, not exhaustion.** Surfaces answer "what deserves attention?" —
   top-5 first, drill-down second. Density serves decision speed.
3. **The number is the hero.** KPIs, trends, and money are typographically
   privileged: tabular numerals, Indian notation, quiet labels.
4. **Bilingual dignity.** Hindi is a first-class script with its own vertical
   rhythm (~15% more line height), never a squeezed translation.
5. **Government-grade calm.** One saffron accent against navy and parchment;
   urgency is signalled by small, precise colour marks — never by shouting.

## Accessibility & Inclusion

- UX4G Design System 2.0 accessibility base; WCAG 2.1 AA as the floor
  (body text ≥4.5:1, large text ≥3:1).
- Full `prefers-reduced-motion` support — every animation has a static
  fallback.
- Visible keyboard focus (`:focus-visible` rings) on all interactive elements.
- Devanagari rendering tested at every layout: no truncation mid-conjunct.
- Colour is never the only channel for urgency — dots pair with text labels.
