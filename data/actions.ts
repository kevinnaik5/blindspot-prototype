export type ActionPriority = "urgent" | "recommended" | "optional";

export type ActionStyle = "primary" | "destructive" | "secondary" | "external";

export type ActionIcon =
  | "pause"
  | "play"
  | "bell"
  | "rotate-ccw"
  | "external-link"
  | "user-plus"
  | "shield-check"
  | "calendar-clock";

// --- Interactive configuration model ---
// When an action carries an `interactive` block, clicking the action
// opens a side sheet that exposes the three STEER properties:
//   1. scope        → Fine-Grained Control
//   2. swappable    → Swappable Components
//   3. guardrails   → Human Guardrails
// When `interactive` is absent, the action remains a static recommendation
// (e.g. external links that just deep-out to another tool).

export type ActionFieldOption = {
  key: string;
  label: string;
  // Small clarifying line shown under the option label in the picker
  detail?: string;
};

export type ActionScopeField = {
  id: string;
  label: string;
  // Optional helper text below the label
  hint?: string;
  options: ActionFieldOption[];
  defaultKey: string;
};

export type ActionSwapSlot = {
  id: string;
  label: string;
  hint?: string;
  options: ActionFieldOption[];
  defaultKey: string;
};

export type GuardrailImpact = {
  label: string;
  tone?: "critical" | "warning" | "muted";
};

// How destructive the commit is, gates the confirm UI.
//   none      → just a commit button
//   checkbox  → must tick a "I understand" box
//   typed     → must type a literal string (e.g. workflow name)
//   preview   → message preview shown, send-only (no extra gate)
export type ActionRiskTier = "none" | "checkbox" | "typed" | "preview";

export type ActionGuardrails = {
  // Plain-language items describing blast radius
  affected: GuardrailImpact[];
  // One sentence about reversibility — anchors the human to the safety net
  reversibility: string;
  riskTier: ActionRiskTier;
  // For "checkbox" risk tier: label of the box
  confirmCheckboxLabel?: string;
  // For "typed" risk tier: the literal value the operator must type
  confirmTypedValue?: string;
  // Optional preview body for "preview" risk tier (e.g. notification body)
  previewBody?: string;
};

export type ActionInteractive = {
  scope: ActionScopeField[];
  swappable: ActionSwapSlot[];
  guardrails: ActionGuardrails;
  // Footer button label inside the sheet
  commitLabel: string;
  // Pill text shown on the card after a successful commit
  committedLabel: string;
  // Plain-language description after commit, e.g. "Paused 12s ago"
  committedDetail?: string;
  // Label of the inverse action shown on the committed card
  undoLabel: string;
};

export type ActionRecommendation = {
  id: string;
  priority: ActionPriority;
  // Short imperative title
  title: string;
  // Why this is suggested. Plain language, the signature of this view.
  rationale: string;
  // Optional supporting facts shown as small chips beneath the rationale
  context?: string[];
  actionLabel: string;
  actionStyle: ActionStyle;
  icon: ActionIcon;
  // When present, the action button opens a configure-and-commit sheet
  // that surfaces the three STEER properties. When absent, the button
  // is a static recommendation (or external link).
  interactive?: ActionInteractive;
};

const ACTIONS: Record<string, ActionRecommendation[]> = {
  "customer-onboarding": [
    {
      id: "pause",
      priority: "urgent",
      title: "Pause this workflow until Clerk is restored",
      rationale:
        "Pausing prevents an estimated 50 more silent failures per hour while you investigate. New signups will queue and replay automatically once the workflow is resumed.",
      context: [
        "240 signups affected since 8:32 AM",
        "Estimated +12 silent failures by end of hour",
      ],
      actionLabel: "Pause workflow",
      actionStyle: "destructive",
      icon: "pause",
      interactive: {
        scope: [
          {
            id: "pause-scope",
            label: "Pause scope",
            hint: "Choose how far the pause reaches.",
            defaultKey: "this",
            options: [
              {
                key: "this",
                label: "This workflow only",
                detail: "Other workflows keep running normally.",
              },
              {
                key: "with-dependents",
                label: "This workflow + 3 dependents",
                detail:
                  "Also pauses Welcome Email Followups, HubSpot Sync Backfill, and CRM Lead Scoring.",
              },
            ],
          },
          {
            id: "until",
            label: "Until",
            hint: "Choose the resume condition.",
            defaultKey: "clerk-healthy",
            options: [
              {
                key: "clerk-healthy",
                label: "Clerk dependency reports healthy",
                detail: "Auto-resumes when the Clerk webhook returns a non-empty user payload twice in a row.",
              },
              {
                key: "manual",
                label: "Manually resumed",
                detail: "Stays paused until someone explicitly resumes it.",
              },
              {
                key: "one-hour",
                label: "1 hour from now",
                detail: "Fixed-duration pause. Resumes at 3:32 PM regardless of Clerk state.",
              },
              {
                key: "four-hours",
                label: "4 hours from now",
              },
            ],
          },
        ],
        swappable: [
          {
            id: "queue-strategy",
            label: "Queue strategy",
            hint: "What happens to incoming signups while paused.",
            defaultKey: "replay",
            options: [
              {
                key: "replay",
                label: "Replay incoming when resumed",
                detail: "New signups queue and run automatically once paused state lifts.",
              },
              {
                key: "drop",
                label: "Drop incoming",
                detail: "New signups are discarded. They will not be replayed.",
              },
              {
                key: "fallback",
                label: "Route to fallback workflow",
                detail: "Sends incoming to 'Customer Onboarding (manual)' for human follow-up.",
              },
            ],
          },
        ],
        guardrails: {
          affected: [
            { label: "12 in-flight runs", tone: "warning" },
            { label: "240 queued signups (replayable)", tone: "warning" },
            { label: "3 downstream workflows pause indirectly", tone: "muted" },
          ],
          reversibility:
            "Reversible. Resume returns the workflow to running and replays the queue automatically.",
          riskTier: "checkbox",
          confirmCheckboxLabel:
            "I understand 240 queued signups will replay on resume.",
        },
        commitLabel: "Pause workflow",
        committedLabel: "Paused",
        committedDetail: "Queued signups will replay on Resume.",
        undoLabel: "Resume",
      },
    },
    {
      id: "notify-owner",
      priority: "urgent",
      title: "Notify the workflow owner",
      rationale:
        "Mira Chen owns this workflow but likely does not know it is failing. Zapier reports each run as success, so the standard alerts have not fired.",
      context: ["Mira Chen", "mira@acme.co", "Last active 2h ago"],
      actionLabel: "Send notification",
      actionStyle: "primary",
      icon: "bell",
      interactive: {
        scope: [
          {
            id: "recipient",
            label: "Recipient",
            defaultKey: "owner",
            options: [
              {
                key: "owner",
                label: "Mira Chen (owner)",
                detail: "mira@acme.co · last active 2h ago",
              },
              {
                key: "team",
                label: "Workflow team (3 people)",
                detail: "Mira Chen, Theo Brandt, Priya Shah",
              },
              {
                key: "oncall",
                label: "Acme on-call rotation",
                detail: "Currently paging Jamal Park",
              },
            ],
          },
        ],
        swappable: [
          {
            id: "channel",
            label: "Channel",
            hint: "Where the notification is delivered.",
            defaultKey: "slack",
            options: [
              { key: "slack", label: "Slack DM", detail: "Default for this org" },
              { key: "email", label: "Email" },
              { key: "teams", label: "Microsoft Teams" },
              { key: "sms", label: "SMS" },
              { key: "pagerduty", label: "PagerDuty incident" },
            ],
          },
        ],
        guardrails: {
          affected: [{ label: "1 recipient" }],
          reversibility: "Notifications cannot be unsent.",
          riskTier: "preview",
          previewBody:
            "Hi Mira — Customer Onboarding has been silently failing since 8:32 AM. Health is 42/100; 240 signups affected. Suggested first step: pause the workflow until Clerk is restored.\n\n— Acme Blindspot",
        },
        commitLabel: "Send notification",
        committedLabel: "Sent",
        committedDetail: "Mira will see this within seconds.",
        undoLabel: "Send another",
      },
    },
    {
      id: "rollback",
      priority: "recommended",
      title: "Roll back to last known good version (3 days ago)",
      rationale:
        "Rolling back removes the recent template change as a possible factor while Clerk is investigated. Production behaviour returns to the version that ran cleanly before April 23.",
      context: [
        "Last good version: Apr 23, 2:02 PM",
        "Authored by Mira Chen",
      ],
      actionLabel: "Roll back",
      actionStyle: "secondary",
      icon: "rotate-ccw",
      interactive: {
        scope: [
          {
            id: "version",
            label: "Roll back to",
            hint: "Pick the version to redeploy.",
            defaultKey: "apr-23",
            options: [
              {
                key: "apr-23",
                label: "Apr 23, 2:02 PM — Mira Chen",
                detail: "Last version before the template wording change.",
              },
              {
                key: "apr-22",
                label: "Apr 22, 9:14 AM — Mira Chen",
                detail: "Two changes back. No known issues.",
              },
              {
                key: "mar-31",
                label: "Mar 31, 10:14 AM — Theo Brandt",
                detail: "Before the HubSpot signup_source mapping. Older.",
              },
            ],
          },
        ],
        swappable: [
          {
            id: "replay-scope",
            label: "Replay scope",
            hint: "What to do with runs that failed since the rollback point.",
            defaultKey: "failed-only",
            options: [
              {
                key: "none",
                label: "Don't replay",
                detail:
                  "Resume forward only. The 23 silent-failure runs since 8:32 AM stay as-is.",
              },
              {
                key: "failed-only",
                label: "Replay only failed runs since 8:32 AM",
                detail:
                  "23 silent-failure runs replay against the rolled-back version. Successful runs are not re-triggered.",
              },
              {
                key: "all-since",
                label: "Replay all runs since the rollback point",
                detail:
                  "All 30 runs since Apr 23 replay. Most aggressive — risks duplicate downstream effects.",
              },
            ],
          },
        ],
        guardrails: {
          affected: [
            { label: "1 change reverts", tone: "warning" },
            { label: "Welcome email step wording resets to Apr 22", tone: "muted" },
          ],
          reversibility:
            "Reversible. Re-deploying the current version is one click from the post-rollback state.",
          riskTier: "typed",
          confirmTypedValue: "customer-onboarding",
        },
        commitLabel: "Roll back",
        committedLabel: "Rolled back",
        committedDetail: "Now serving the Apr 23 version.",
        undoLabel: "Re-deploy current",
      },
    },
    {
      id: "open-zapier",
      priority: "optional",
      title: "Open in Zapier to inspect or fix manually",
      rationale:
        "If you want to inspect the Clerk webhook configuration directly, open the workflow in Zapier. The webhook may need a new signing secret once Clerk patches the upstream API.",
      actionLabel: "Open in Zapier",
      actionStyle: "external",
      icon: "external-link",
    },
  ],
  "stripe-slack": [
    {
      id: "add-backup-owner",
      priority: "recommended",
      title: "Add a backup owner",
      rationale:
        "Jamal Park is the only owner. Adding a backup means notifications still reach someone if the primary owner is unavailable.",
      actionLabel: "Add owner",
      actionStyle: "primary",
      icon: "user-plus",
    },
    {
      id: "subscribe",
      priority: "optional",
      title: "Subscribe to alerts for this workflow",
      rationale:
        "You will be notified when the health score drops below 80 or any anomaly is detected.",
      actionLabel: "Subscribe",
      actionStyle: "secondary",
      icon: "bell",
    },
  ],
  "typeform-notion": [
    {
      id: "migrate-notion",
      priority: "urgent",
      title: "Migrate to the Notion Data Sources API",
      rationale:
        "The legacy database append endpoint used by step 'Append to database' will be removed on May 26. Migrating ahead of time prevents a sudden break.",
      context: ["Affected step: Append to database", "30 days remaining"],
      actionLabel: "Open migration guide",
      actionStyle: "primary",
      icon: "shield-check",
    },
    {
      id: "remind-migration",
      priority: "recommended",
      title: "Schedule a reminder one week before deprecation",
      rationale:
        "If the migration is not done by May 19, this reminder triggers a follow-up notification so the team has runway to act.",
      context: ["Reminder date: May 19"],
      actionLabel: "Schedule reminder",
      actionStyle: "secondary",
      icon: "calendar-clock",
    },
  ],
  "github-linear": [
    {
      id: "subscribe-gh-linear",
      priority: "optional",
      title: "Subscribe to alerts for this workflow",
      rationale:
        "You will be notified when the health score drops below 80 or any anomaly is detected.",
      actionLabel: "Subscribe",
      actionStyle: "secondary",
      icon: "bell",
    },
  ],
  "revenue-report": [
    {
      id: "subscribe-revenue",
      priority: "optional",
      title: "Subscribe to alerts for this workflow",
      rationale:
        "You will be notified if the daily report misses its 8:00 AM PT window.",
      actionLabel: "Subscribe",
      actionStyle: "secondary",
      icon: "bell",
    },
  ],
};

export function getActions(workflowId: string): ActionRecommendation[] {
  return ACTIONS[workflowId] ?? [];
}

export const PRIORITY_ORDER: Record<ActionPriority, number> = {
  urgent: 0,
  recommended: 1,
  optional: 2,
};
