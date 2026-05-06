export type Platform = "zapier" | "n8n" | "make" | "workato" | "pipedream";
export type WorkflowStatus =
  | "healthy"
  | "failing-silently"
  | "degraded"
  | "paused";

export type IndicatorTone = "critical" | "warning" | "info" | "muted" | "ok";

export type WorkflowStep = {
  id: string;
  service: string;
  label: string;
  state: "ok" | "warning" | "error" | "idle";
  // Plain-language note rendered next to the node when applicable
  note?: string;
};

export type WorkflowEdge = { from: string; to: string };

export type WorkflowChange = {
  // ISO timestamp
  at: string;
  // Author. Omit if the source platform itself is the author.
  who?: string;
  summary: string;
  // Marks this change as the suspected cause of the current incident
  significant?: boolean;
};

export type DependencyHealth = "ok" | "degraded" | "down";

export type Dependency = {
  service: string;
  health: DependencyHealth;
  note?: string;
};

export type Cadence = {
  trigger: string;
  volume: string;
};

export type CurrentStateIndicator = {
  label: string;
  value: string;
  tone?: IndicatorTone;
};

export type CurrentState = {
  // One-line status at a glance
  headline: string;
  // Optional short context, max one sentence
  detail?: string;
  indicators: CurrentStateIndicator[];
};

export type Workflow = {
  id: string;
  name: string;
  platform: Platform;
  owner: { name: string; email: string };
  status: WorkflowStatus;
  statusLine: string;
  createdAt: string;
  lastRunAt: string;
  cadence: Cadence;
  intent: string;
  currentState: CurrentState;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  positions: Record<string, { x: number; y: number }>;
  changes: WorkflowChange[];
  dependencies: Dependency[];
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "customer-onboarding",
    name: "Customer Onboarding → Welcome Email + CRM sync",
    platform: "zapier",
    owner: { name: "Mira Chen", email: "mira@acme.co" },
    status: "failing-silently",
    statusLine: "Failing silently for 6h",
    createdAt: "2025-09-12T10:00:00Z",
    lastRunAt: "2026-04-26T14:26:00Z",
    cadence: {
      trigger: "On new signup (Clerk)",
      volume: "40 to 60 / hour",
    },
    intent:
      "When a new customer signs up via Clerk, send a personalised welcome email through Postmark and create a contact record in HubSpot so sales can reach out within the day.",
    currentState: {
      headline: "Silently failing since 8:32 AM (6h ago).",
      detail:
        "Each run reports success but downstream steps see no email address to act on.",
      indicators: [
        { label: "Started", value: "6h ago" },
        { label: "Signups affected", value: "240", tone: "critical" },
        { label: "Welcome emails skipped", value: "240", tone: "critical" },
        { label: "HubSpot records missed", value: "240", tone: "critical" },
        { label: "Slack posts (empty)", value: "240", tone: "warning" },
      ],
    },
    steps: [
      {
        id: "trigger",
        service: "clerk",
        label: "New user created",
        state: "warning",
        note: "Returning 200 with empty user payload",
      },
      { id: "format", service: "code", label: "Format payload", state: "ok" },
      {
        id: "email",
        service: "postmark",
        label: "Send welcome email",
        state: "error",
        note: "Skipped, no email field",
      },
      {
        id: "crm",
        service: "hubspot",
        label: "Create HubSpot contact",
        state: "error",
        note: "Skipped, no email field",
      },
      {
        id: "notify",
        service: "slack",
        label: "Post to #signups",
        state: "ok",
        note: "Posting empty rows",
      },
    ],
    edges: [
      { from: "trigger", to: "format" },
      { from: "format", to: "email" },
      { from: "format", to: "crm" },
      { from: "format", to: "notify" },
    ],
    positions: {
      trigger: { x: 0, y: 140 },
      format: { x: 280, y: 140 },
      email: { x: 560, y: 0 },
      crm: { x: 560, y: 140 },
      notify: { x: 560, y: 280 },
    },
    changes: [
      {
        at: "2026-04-26T08:32:00Z",
        who: "Clerk (upstream)",
        summary:
          "Webhook payload changed. The user object is now empty on signup events. No Acme deploy went out around this time.",
        significant: true,
      },
      {
        at: "2026-04-23T14:02:00Z",
        who: "Mira Chen",
        summary: "Updated welcome email template wording.",
      },
      {
        at: "2026-03-31T10:14:00Z",
        who: "Theo Brandt",
        summary: "Mapped HubSpot custom field 'signup_source'.",
      },
    ],
    dependencies: [
      {
        service: "Clerk",
        health: "degraded",
        note: "Auth API returns 200 with empty body",
      },
      { service: "Postmark", health: "ok" },
      { service: "HubSpot", health: "ok" },
      { service: "Slack", health: "ok" },
    ],
  },
  {
    id: "stripe-slack",
    name: "Stripe payment → Slack notification",
    platform: "zapier",
    owner: { name: "Jamal Park", email: "jamal@acme.co" },
    status: "healthy",
    statusLine: "Running normally",
    createdAt: "2024-11-04T10:00:00Z",
    lastRunAt: "2026-04-26T14:29:00Z",
    cadence: {
      trigger: "On every Stripe charge",
      volume: "~120 / day",
    },
    intent:
      "Notify the #revenue Slack channel whenever Stripe captures a payment over $500, so the team has live awareness of larger deals.",
    currentState: {
      headline: "Running normally for the last 30 days.",
      detail: "The most recent run completed in under a second.",
      indicators: [
        { label: "Last run", value: "1m ago" },
        { label: "Avg duration", value: "0.6s" },
        { label: "Failures (24h)", value: "0", tone: "ok" },
      ],
    },
    steps: [
      { id: "trigger", service: "stripe", label: "Charge succeeded", state: "ok" },
      { id: "filter", service: "filter", label: "Amount > $500", state: "ok" },
      { id: "notify", service: "slack", label: "Post to #revenue", state: "ok" },
    ],
    edges: [
      { from: "trigger", to: "filter" },
      { from: "filter", to: "notify" },
    ],
    positions: {
      trigger: { x: 0, y: 80 },
      filter: { x: 280, y: 80 },
      notify: { x: 560, y: 80 },
    },
    changes: [
      {
        at: "2026-04-10T09:00:00Z",
        who: "Jamal Park",
        summary: "Raised filter threshold from $250 to $500.",
      },
    ],
    dependencies: [
      { service: "Stripe", health: "ok" },
      { service: "Slack", health: "ok" },
    ],
  },
  {
    id: "typeform-notion",
    name: "Typeform submission → Notion + Email",
    platform: "make",
    owner: { name: "Priya Shah", email: "priya@acme.co" },
    status: "healthy",
    statusLine: "Running normally",
    createdAt: "2024-08-20T10:00:00Z",
    lastRunAt: "2026-04-26T14:18:00Z",
    cadence: {
      trigger: "On submission",
      volume: "~8 / day",
    },
    intent:
      "Capture feedback from the customer Typeform into a Notion database and email a daily digest to the product team.",
    currentState: {
      headline: "Running normally.",
      detail:
        "Notion will deprecate the legacy database append endpoint used here on May 26 (about 30 days away).",
      indicators: [
        { label: "Removed in", value: "30 days", tone: "warning" },
        { label: "Affected step", value: "Append to database" },
        { label: "Last run", value: "12m ago" },
      ],
    },
    steps: [
      { id: "trigger", service: "typeform", label: "Form submitted", state: "ok" },
      { id: "notion", service: "notion", label: "Append to database", state: "ok" },
      { id: "email", service: "gmail", label: "Send digest", state: "ok" },
    ],
    edges: [
      { from: "trigger", to: "notion" },
      { from: "notion", to: "email" },
    ],
    positions: {
      trigger: { x: 0, y: 80 },
      notion: { x: 280, y: 80 },
      email: { x: 560, y: 80 },
    },
    changes: [],
    dependencies: [
      { service: "Typeform", health: "ok" },
      { service: "Notion", health: "ok" },
      { service: "Gmail", health: "ok" },
    ],
  },
  {
    id: "github-linear",
    name: "GitHub issue → Linear sync",
    platform: "n8n",
    owner: { name: "Theo Brandt", email: "theo@acme.co" },
    status: "healthy",
    statusLine: "Running normally",
    createdAt: "2025-02-01T10:00:00Z",
    lastRunAt: "2026-04-26T14:27:00Z",
    cadence: {
      trigger: "On new issue",
      volume: "~30 / day",
    },
    intent:
      "Mirror new GitHub issues into Linear so engineering can triage them in one place.",
    currentState: {
      headline: "Running normally.",
      detail: "No changes in the last 30 days.",
      indicators: [
        { label: "Last run", value: "3m ago" },
        { label: "Avg duration", value: "1.2s" },
        { label: "Failures (24h)", value: "0", tone: "ok" },
      ],
    },
    steps: [
      { id: "trigger", service: "github", label: "Issue opened", state: "ok" },
      { id: "linear", service: "linear", label: "Create Linear issue", state: "ok" },
      { id: "comment", service: "github", label: "Post sync comment", state: "ok" },
    ],
    edges: [
      { from: "trigger", to: "linear" },
      { from: "linear", to: "comment" },
    ],
    positions: {
      trigger: { x: 0, y: 80 },
      linear: { x: 280, y: 80 },
      comment: { x: 560, y: 80 },
    },
    changes: [],
    dependencies: [
      { service: "GitHub", health: "ok" },
      { service: "Linear", health: "ok" },
    ],
  },
  {
    id: "revenue-report",
    name: "Daily revenue report → Slack",
    platform: "zapier",
    owner: { name: "Jamal Park", email: "jamal@acme.co" },
    status: "healthy",
    statusLine: "Last sent at 8:00 today",
    createdAt: "2024-06-14T10:00:00Z",
    lastRunAt: "2026-04-26T08:00:00Z",
    cadence: {
      trigger: "Daily at 08:00 PT",
      volume: "1 / day",
    },
    intent:
      "Pull the previous day's revenue from Stripe and post a formatted summary to #leadership every morning at 8 AM.",
    currentState: {
      headline: "Today's report posted on schedule at 8:00 AM.",
      detail: "Past 30 runs all completed within 4 seconds.",
      indicators: [
        { label: "Last run", value: "Today, 8:00 AM" },
        { label: "Avg duration", value: "3.1s" },
        { label: "Failures (30d)", value: "0", tone: "ok" },
      ],
    },
    steps: [
      { id: "trigger", service: "schedule", label: "8:00 AM daily", state: "ok" },
      { id: "stripe", service: "stripe", label: "Fetch yesterday's charges", state: "ok" },
      { id: "format", service: "code", label: "Format summary", state: "ok" },
      { id: "post", service: "slack", label: "Post to #leadership", state: "ok" },
    ],
    edges: [
      { from: "trigger", to: "stripe" },
      { from: "stripe", to: "format" },
      { from: "format", to: "post" },
    ],
    positions: {
      trigger: { x: 0, y: 80 },
      stripe: { x: 280, y: 80 },
      format: { x: 560, y: 80 },
      post: { x: 840, y: 80 },
    },
    changes: [],
    dependencies: [
      { service: "Stripe", health: "ok" },
      { service: "Slack", health: "ok" },
    ],
  },
];

export function getWorkflow(id: string): Workflow | undefined {
  return WORKFLOWS.find((w) => w.id === id);
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  zapier: "Zapier",
  n8n: "n8n",
  make: "Make",
  workato: "Workato",
  pipedream: "Pipedream",
};
