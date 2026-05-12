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
  // When the change is the suspected cause, link it to the action that
  // best addresses it so the operator can hand off from diagnosis to fix.
  suggestedActionId?: string;
};

export type DependencyHealth = "ok" | "degraded" | "down";

export type Dependency = {
  service: string;
  health: DependencyHealth;
  note?: string;
  // What this workflow expects from this dependency. Pairs with `health`
  //, when the dep drifts, the contract is what's broken.
  expectation?: string;
};

export type SLOTone = "ok" | "warning" | "critical";

export type SLO = {
  // Plain-language description of what is being measured
  metric: string;
  // The target this workflow promises (e.g. "95% within 2 minutes")
  target: string;
  // The current observation, optional
  current?: string;
  tone?: SLOTone;
  // What missing this SLO costs in business terms
  consequence?: string;
};

export type StakeholderRole = "owner" | "escalation" | "consumer" | "approver";

export type Stakeholder = {
  name: string;
  role: StakeholderRole;
  // One-line description of why this person/team is on the list
  detail?: string;
  contact?: string;
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
  // One-line business outcome, the "north star" the workflow exists for.
  // Read by the Intent tab as the primary headline.
  goal?: string;
  currentState: CurrentState;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  positions: Record<string, { x: number; y: number }>;
  changes: WorkflowChange[];
  dependencies: Dependency[];
  // Optional intent-tab content. Falls back to {owner} when absent.
  slos?: SLO[];
  stakeholders?: Stakeholder[];
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
    goal: "Every new customer feels welcomed within minutes of signup, and Sales has the record to follow up the same day.",
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
        suggestedActionId: "pause",
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
        expectation:
          "Non-empty user payload (id, email, first_name, last_name) on every signup webhook.",
      },
      {
        service: "Postmark",
        health: "ok",
        expectation:
          "Send completes in under 5 seconds with 99% inbox delivery.",
      },
      {
        service: "HubSpot",
        health: "ok",
        expectation:
          "Contact creation idempotent on email, completes within 10 seconds.",
      },
      {
        service: "Slack",
        health: "ok",
        expectation:
          "Posts arrive in #signups within 60 seconds with name + email.",
      },
    ],
    slos: [
      {
        metric: "End-to-end signup completion",
        target: "95% of signups complete the workflow within 2 minutes",
        current: "0% in the last 6 hours",
        tone: "critical",
        consequence:
          "Every customer who signed up since 8:32 AM has a broken first impression.",
      },
      {
        metric: "Welcome email delivered",
        target: "100% of signups receive a welcome email within 5 minutes",
        current: "0%, 240 emails skipped silently since 8:32 AM",
        tone: "critical",
        consequence:
          "240 customers are waiting for an email that will never arrive.",
      },
      {
        metric: "HubSpot contact created",
        target: "100% of signups land in HubSpot within 5 minutes",
        current: "0%, 240 contacts missing since 8:32 AM",
        tone: "critical",
        consequence:
          "Sales has no record of these signups; same-day follow-up is blocked.",
      },
      {
        metric: "Slack #signups visibility",
        target: "Every signup posted with name and email for live awareness",
        current: "Posting empty rows since 8:32 AM",
        tone: "warning",
        consequence:
          "The team sees activity but can't act on it without a payload.",
      },
    ],
    stakeholders: [
      {
        name: "Mira Chen",
        role: "owner",
        detail: "Owns the welcome email copy and the workflow definition.",
        contact: "mira@acme.co",
      },
      {
        name: "Revenue Operations",
        role: "escalation",
        detail: "Paged when an SLO breaches for more than 30 minutes.",
      },
      {
        name: "Theo Brandt, Sales",
        role: "consumer",
        detail:
          "Relies on the HubSpot record landing within the day to follow up.",
      },
      {
        name: "Marketing",
        role: "consumer",
        detail:
          "Tracks the welcome-email open rate as a campaign signal.",
      },
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
    goal: "Revenue gets live awareness of every meaningful payment within seconds.",
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
      {
        service: "Stripe",
        health: "ok",
        expectation:
          "Charge events delivered within 2 seconds of capture.",
      },
      {
        service: "Slack",
        health: "ok",
        expectation: "Posts arrive in #revenue within 5 seconds of trigger.",
      },
    ],
    slos: [
      {
        metric: "Notification posted",
        target: "Notification reaches #revenue within 30 seconds of charge",
        current: "Median 0.6s",
        tone: "ok",
      },
    ],
    stakeholders: [
      {
        name: "Jamal Park",
        role: "owner",
        detail: "Maintains the filter threshold and the message format.",
        contact: "jamal@acme.co",
      },
      {
        name: "Revenue team",
        role: "consumer",
        detail: "Reads the channel for live awareness on bigger deals.",
      },
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
    goal: "Every customer comment lands in Notion within minutes so the product team can triage and respond.",
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
      {
        service: "Typeform",
        health: "ok",
        expectation: "Webhook fires within 10 seconds of form submission.",
      },
      {
        service: "Notion",
        health: "ok",
        expectation:
          "Append to database completes via the legacy endpoint (sunset May 26).",
      },
      {
        service: "Gmail",
        health: "ok",
        expectation: "Daily digest delivers by 9:00 AM PT.",
      },
    ],
    slos: [
      {
        metric: "Submission landed in Notion",
        target: "100% of submissions appear in the database within 5 minutes",
        current: "100% over the last 30 days",
        tone: "ok",
      },
      {
        metric: "Endpoint compatibility",
        target: "Workflow uses a non-deprecated Notion API",
        current:
          "Using legacy database append endpoint, removed on May 26 (30 days)",
        tone: "warning",
        consequence:
          "If not migrated by May 26, all submissions will fail without warning.",
      },
    ],
    stakeholders: [
      {
        name: "Priya Shah",
        role: "owner",
        detail: "Maintains the Notion schema and Typeform questions.",
        contact: "priya@acme.co",
      },
      {
        name: "Product team",
        role: "consumer",
        detail: "Reads the daily digest and triages feedback in Notion.",
      },
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
    goal: "Engineering triages every reported issue in Linear without switching tools.",
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
      {
        service: "GitHub",
        health: "ok",
        expectation: "Issue webhook fires within 5 seconds of issue open.",
      },
      {
        service: "Linear",
        health: "ok",
        expectation: "Issue creation idempotent on the GitHub issue id.",
      },
    ],
    slos: [
      {
        metric: "Linear issue created",
        target: "100% of GitHub issues mirrored within 1 minute",
        current: "100% over the last 90 days",
        tone: "ok",
      },
    ],
    stakeholders: [
      {
        name: "Theo Brandt",
        role: "owner",
        detail: "Maintains the GitHub-to-Linear field mapping.",
        contact: "theo@acme.co",
      },
      {
        name: "Engineering",
        role: "consumer",
        detail: "Triages issues in Linear without leaving the tool.",
      },
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
    goal: "Leadership starts every morning with yesterday's revenue summary at 8 AM PT.",
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
      {
        service: "Stripe",
        health: "ok",
        expectation: "Charges API responds within 5 seconds.",
      },
      {
        service: "Slack",
        health: "ok",
        expectation: "Post to #leadership delivers within 30 seconds.",
      },
    ],
    slos: [
      {
        metric: "Daily report on time",
        target: "Posted to #leadership by 8:05 AM PT every weekday",
        current: "100% on time over the last 30 days",
        tone: "ok",
      },
    ],
    stakeholders: [
      {
        name: "Jamal Park",
        role: "owner",
        detail: "Maintains the report template and the schedule.",
        contact: "jamal@acme.co",
      },
      {
        name: "Leadership",
        role: "consumer",
        detail: "Reads the summary at the start of each weekday.",
      },
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
