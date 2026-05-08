# Blindspot

**Observability for workflow automations that fail silently.**

A design prototype for a monitoring product that reframes visibility into Zapier, n8n, Make, and agentic workflows around four lenses — so when a workflow silently breaks, ops staff can see it, understand it, and act on it without losing context.

**Live demo:** [blindspot-prototype.vercel.app](https://blindspot-prototype.vercel.app/)

---

## The problem

Workflow automations fail in a particular way: every run reports success, but no real work happens downstream. The webhook returns a 200 with an empty payload. The "send email" step skips silently because there's no address to send to. The CRM gets an empty record. From the outside, the platform looks healthy. From the inside, customers are slipping through the cracks.

Existing monitoring tools surface failed runs. They don't surface *successful runs that did nothing*. And even when something is detected, ops staff have to manually correlate it across dashboards, runbooks, and tickets to figure out what to do — losing context at every step.

Blindspot is built around a different framing.

---

## The framework

Four lenses, each a tab in the workflow detail view:

| Lens | What it answers | What lives here |
|---|---|---|
| **Intent** | *What is this workflow supposed to do, and against what contract?* | Goal, mission, service-level objectives, stakeholders, dependency contracts |
| **Flow** | *How is it wired together?* | Step-by-step breadcrumb, node graph, run timeline, run history, inspect drawer |
| **Health** | *How is it running right now?* | Health score, learned baselines, run composition over time, anomalies, 7-day timeline |
| **Actions** | *What should I do about the deviations?* | Recommended next step (hero), configurable side sheet (scope · swappable components · human guardrails), step-by-step checklist |

Intent grounds the other three. SLOs are what Health compares against. Dependency contracts are what STEER's "Pause" defends when an upstream breaks.

The three pillars (SEE → SENSE → STEER) drive the actionable arc. INTENT sits underneath as the contract that gives the other three meaning.

---

## Demo walkthrough

The whole thing is anchored to one scenario: **Customer Onboarding has been silently failing for 6 hours.** Clerk's webhook started returning empty user payloads, so welcome emails skip and HubSpot contacts go un-created. Every run reports success. 240 signups affected.

Walk it like this:

1. **Land on home** ([/](https://blindspot-prototype.vercel.app/)). The "Needs attention" hero band shows Customer Onboarding marked critical. Sidebar's Status card has a critical-toned ring; "Heads up" carries a separate Notion deprecation notice; "Recent activity" shows the Clerk webhook event as the most recent significant change.

2. **Click into Customer Onboarding → Intent.** Read the goal ("Every new customer feels welcomed within minutes…"). Three SLOs are marked **Violated**, one **Drifting**. Four dependency contracts — Clerk reads **Drifting** with the broken expectation. The contract framing makes the silent failure feel grounded, not abstract.

3. **Switch to Health.** Score 42/100. The Run composition card shows a stacked bar chart: green bars for 16 hours, then a sharp wall of yellow starting at 8:32 AM. Anomalies list four issues. Each anomaly has a **View suggested action** button.

4. **Click "View suggested action" on the auth-drop anomaly.** Lands on the Actions tab with the Pause card pulsing — focus deep-link via `?focus=pause`.

5. **Click Pause workflow.** A side sheet slides in from the right, exposing the three STEER properties:
   - **Scope** (Fine-Grained Control) — pause this workflow only / + dependents; until Clerk healthy / manually resumed / 1h / 4h
   - **Components** (Swappable Components) — queue strategy: replay, drop, or route to fallback
   - **Guardrails** (Human Guardrails) — blast radius (12 in-flight runs · 240 queued signups · 3 downstream workflows), reversibility note, checkbox confirm gate

6. **Tick the confirmation, click Pause.** Sheet closes. The hero card transitions in-place to a "Paused — Just now" state showing the chosen config (*This workflow only · Until Clerk healthy · Replay incoming when resumed*) and a Resume button. The right-rail checklist marks Pause complete with a green check; the connector line above it turns ok-toned; the next step (Notify the workflow owner) becomes the new hero.

The scenario continues — Notify uses a preview-style guardrail, Rollback uses a typed-name confirm — until the checklist is fully ticked.

---

## What's in the prototype

**Per-pillar coverage:**

- **Intent** — Purpose (goal + mission), Service-level objectives with violation tones, Stakeholders by role, Dependency contracts with expectations
- **Flow** — Step view (chevron breadcrumb), Node view (interactive graph via @xyflow/react), Timeline view (waterfall), Run history (filterable by status + time range), inspect drawer with current state, recent changes, dependencies
- **Health** — Health score card, learned baselines (numeric + text-diff), run composition (stacked bar chart bucketed by hour, with crosslink to filtered run history), 7-day score timeline, detected anomalies
- **Actions** — Hero progression (advances to next uncommitted action), configurable side sheet exposing all three STEER properties, risk-tier-aware confirm gates (none / checkbox / typed / preview), right-rail checklist with timeline connector, post-commit shows operator's chosen config
- **Cross-tab handoffs** — anomaly→action linkage in fixtures, `<HandoffLink>` button (tone- and size-aware), `?focus=<id>` deep-link with smooth scroll + pulse, action count badge on the Actions tab, lens strip per tab for orientation

**Home page** — Quick start (dismissible), critical-only "Needs attention" hero band, full workflow list with Status + Platform filter chips. Sidebar: Status card (tone-aware ring), Heads up (non-critical alerts), Recent activity (cross-workflow change feed).

---

## Tech stack

- **Next.js 15** (App Router) + **React 19**
- **TypeScript** strict
- **Tailwind 3** with custom CSS variable tokens (`--ok`, `--warning`, `--critical`, `--info`, `--panel`, etc.) — themable color system
- **Recharts** for the timeline + run-composition charts
- **@xyflow/react** for the workflow node graph
- **lucide-react** for icons
- **clsx** + **tailwind-merge** via a `cn()` utility for class composition

No state management library, no database, no API layer. All UI state is local React state; all data is in-memory fixtures in `data/*.ts`.

---

## Local development

```bash
git clone https://github.com/kevinnaik5/blindspot-prototype.git
cd blindspot-prototype
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The Customer Onboarding scenario is the default demo workflow.

Type-check: `npx tsc --noEmit`

---

## Project structure

```
app/
  page.tsx                          home
  workflows/[id]/
    layout.tsx                      shared chrome (header, tabs, lens strip)
    page.tsx                        Flow tab (default)
    intent/page.tsx                 Intent tab
    health/page.tsx                 Health tab
    actions/page.tsx                Actions tab

components/
  views/
    intent-view.tsx                 4 sections: purpose · SLOs · stakeholders · deps
    health-view.tsx                 score · learned baselines · run composition (chart) · anomalies
    actions-view.tsx                hero + checklist + sheet wiring
    run-history-view.tsx            filterable run list
    timeline-view.tsx, step-view.tsx, graph-view.tsx
    focusable-action-item.tsx       handles ?focus=<id> deep-link scroll+pulse
  actions/
    action-sheet.tsx                STEER configure sheet (scope · swap · guardrails · commit)
  workflow-tabs.tsx                 tab nav with action count badge
  workflow-inspect-drawer.tsx       slide-in panel on Flow tab
  lens-header.tsx                   per-tab "Lens · tagline" strip
  workflow-list.tsx                 home table with filters
  quick-start.tsx                   onboarding panel (dismissible)
  handoff-link.tsx                  unified cross-tab action button (tone + size variants)

data/
  workflows.ts                      workflows + steps + edges + dependencies + intent + SLOs + stakeholders
  runs.ts                           run fixtures with step-bar timings
  health.ts                         health scores, learned baselines, anomalies
  actions.ts                        ActionRecommendation with interactive scope/swap/guardrails
  alerts.ts                         home page alert cards
  step-details.ts                   inputs / outputs / config per step
```

---

## Scope and limitations

This is a prototype, not a product. Honest list of what's in and what isn't:

- **No backend.** Everything runs against in-memory fixtures. Action commits update local React state; refreshing the Actions page resets the committed steps.
- **No real platform integration.** "Connect a platform" / "Import a workflow" are placeholder onboarding cards. The Zapier / n8n / Make labels are cosmetic.
- **Pickers are demonstrative.** Scope and swap selections are captured at commit time and shown back in the post-commit "Configured" line, but no real workflow state mutates.
- **Browser interactions not exhaustively tested.** Routes return 200 and HTML sentinels match expected structure; the picker-open, typed-confirm, and focus-pulse interactions were verified by code review and types only.
- **Mobile / narrow widths.** The layout reflows below `lg` (right rail hides on Actions, sidebar reflows on home), but it's optimized for desktop.

The point of the prototype is to demonstrate the framework — what each pillar actually looks like in the UI, how they connect, what decisions a designed observability tool would make. Treat it as that, not as production code.

---

## Credits

Designed and built by **Kevin Naik** ([kevinnaik5](https://github.com/kevinnaik5)).

Framework diagram and product brief are the author's. The Customer Onboarding silent-failure scenario is fabricated for the demo.
