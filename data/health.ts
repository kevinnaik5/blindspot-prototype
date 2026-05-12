export type AnomalySeverity = "critical" | "warning" | "notice";

export type Anomaly = {
  id: string;
  at: string;
  severity: AnomalySeverity;
  // One-line plain-language summary
  summary: string;
  // Optional context, kept short
  detail?: string;
  // Links this anomaly to a recommended action so the operator can hand
  // off from observation to remediation without losing context.
  suggestedActionId?: string;
};

export type HealthPoint = {
  at: string;
  score: number;
};

export type ChartAnnotation = {
  // Position on the x-axis (timestamp string from timeline)
  at: string;
  label: string;
  // Hint of which side to anchor the label so it stays inside the chart
  side?: "left" | "right";
};

export type HealthStatTone = "critical" | "warning" | "ok" | "muted";

export type HealthStatVisual =
  | { kind: "clock" }
  | { kind: "ratio"; pct: number }
  | { kind: "compare"; current: number; baseline: number; max: number }
  | { kind: "people"; total: number };

export type HealthStat = {
  label: string;
  value: string;
  tone?: HealthStatTone;
  // Optional supporting line shown beneath the big value
  caption?: string;
  // Optional small visualization specific to the stat
  visual?: HealthStatVisual;
};

export type LearnedBaseline = {
  metric: string;
  // What we've learned to expect (range or single value)
  baseline: string;
  // Today's value, side by side with the baseline
  current: string;
  // Plain-language description of the deviation, or "Within baseline"
  deviation: string;
  tone: "ok" | "warning" | "critical";
  // Numeric fields powering the mini range bar visualization
  numeric?: {
    scaleMax: number;
    baselineValue: number;
    baselineRange?: [number, number];
    currentValue: number;
    unit?: string;
  };
  // For non-numeric metrics, a side-by-side text diff visual
  textDiff?: {
    expected: string;
    received: string;
  };
  suggestedActionId?: string;
};

export type LearnedProfile = {
  // Plain-language description of what the system observed to build the baselines
  observationWindow: string;
  baselines: LearnedBaseline[];
};

// The learning runtime that produced this workflow's learned baselines
// and anomaly signals. Names the SENSE pillar's "Continuous Learning"
// property so the AI loop is visible to the operator instead of implicit.
export type LearningSystem = {
  // Display name of the learning runtime
  name: string;
  version?: string;
  // ISO timestamp of the most recent retraining / refresh
  lastRefreshedAt?: string;
  // Count of historical runs the loop has reviewed
  runsAnalyzed?: number;
  // Confidence in normal behavior, on a 0 to 1 scale. Prior and latest.
  confidencePrior?: number;
  confidenceLatest?: number;
  // Plain-language description of what the loop noticed
  insight?: string;
};

export type WorkflowHealth = {
  // Current score (0 to 100)
  score: number;
  // Difference vs the prior day, used as a small delta in the header
  deltaSinceYesterday: number;
  // One-line plain-language status
  annotation: string;
  // Footer stats shown inside the score card
  keyStats: HealthStat[];
  // Optional, the learning runtime behind this workflow's calibration
  learningSystem?: LearningSystem;
  // Baselines learned from prior behaviour, plus today's deviation
  learned: LearnedProfile;
  // Time series for the chart (oldest first)
  timeline: HealthPoint[];
  // Inline labels rendered on top of the chart instead of tooltips
  chartAnnotations: ChartAnnotation[];
  anomalies: Anomaly[];
};

const HEALTH: Record<string, WorkflowHealth> = {
  "customer-onboarding": {
    score: 42,
    deltaSinceYesterday: -57,
    annotation:
      "Critical. The workflow has reported success but produced no real output for 6 hours.",
    learningSystem: {
      name: "Continuous learning",
      lastRefreshedAt: "2026-04-24T18:00:00Z",
      runsAnalyzed: 1847,
      confidencePrior: 0.92,
      confidenceLatest: 0.12,
      insight:
        "Confidence in normal behavior dropped sharply when Clerk started sending empty user data. We flagged the change hours before the health score moved.",
    },
    keyStats: [
      {
        label: "Last healthy",
        value: "6h ago",
        tone: "critical",
        caption: "Last good run at 8:15 AM",
        visual: { kind: "clock" },
      },
      {
        label: "Runs (24h)",
        value: "30",
        caption: "Typical: ~50 / day",
        visual: { kind: "compare", current: 30, baseline: 50, max: 60 },
      },
      {
        label: "Silent failures",
        value: "22",
        tone: "critical",
        caption: "73% of recent runs",
        visual: { kind: "ratio", pct: 73 },
      },
      {
        label: "Signups affected",
        value: "240",
        tone: "critical",
        caption: "And counting",
        visual: { kind: "people", total: 240 },
      },
    ],
    learned: {
      observationWindow: "Calibrated over 8 days from 1,847 historical runs.",
      baselines: [
        {
          metric: "Median duration",
          baseline: "720ms ± 50",
          current: "280ms",
          deviation: "61% faster than baseline. Real downstream work isn't happening.",
          tone: "warning",
          numeric: {
            scaleMax: 1000,
            baselineValue: 720,
            baselineRange: [670, 770],
            currentValue: 280,
            unit: "ms",
          },
        },
        {
          metric: "Output success rate",
          baseline: "99.2%",
          current: "0%",
          deviation: "Pure functional failure since 8:32 AM.",
          tone: "critical",
          numeric: {
            scaleMax: 100,
            baselineValue: 99.2,
            baselineRange: [98.5, 99.8],
            currentValue: 0,
            unit: "%",
          },
          suggestedActionId: "pause",
        },
        {
          metric: "Payload shape",
          baseline: "user.{id, email, first_name, last_name}",
          current: "empty user{}",
          deviation: "Schema mismatch detected on every run.",
          tone: "critical",
          textDiff: {
            expected: "user.{ id, email, first_name, last_name }",
            received: "user.{ }",
          },
          suggestedActionId: "open-zapier",
        },
        {
          metric: "Volume per hour",
          baseline: "~50 outputs/hour",
          current: "0/hour",
          deviation: "Zero throughput for 6 hours.",
          tone: "critical",
          numeric: {
            scaleMax: 60,
            baselineValue: 50,
            baselineRange: [40, 60],
            currentValue: 0,
            unit: "/hr",
          },
        },
      ],
    },
    timeline: [
      { at: "2026-04-20T00:00:00Z", score: 98 },
      { at: "2026-04-20T12:00:00Z", score: 98 },
      { at: "2026-04-21T00:00:00Z", score: 99 },
      { at: "2026-04-21T12:00:00Z", score: 98 },
      { at: "2026-04-22T00:00:00Z", score: 99 },
      { at: "2026-04-22T12:00:00Z", score: 99 },
      { at: "2026-04-23T00:00:00Z", score: 97 },
      { at: "2026-04-23T12:00:00Z", score: 97 },
      { at: "2026-04-24T00:00:00Z", score: 98 },
      { at: "2026-04-24T12:00:00Z", score: 98 },
      { at: "2026-04-25T00:00:00Z", score: 99 },
      { at: "2026-04-25T12:00:00Z", score: 99 },
      { at: "2026-04-26T00:00:00Z", score: 99 },
      { at: "2026-04-26T08:00:00Z", score: 99 },
      { at: "2026-04-26T08:30:00Z", score: 99 },
      // Sharp drop when the Clerk webhook starts returning empty payloads
      { at: "2026-04-26T08:33:00Z", score: 42 },
      { at: "2026-04-26T10:00:00Z", score: 42 },
      { at: "2026-04-26T12:00:00Z", score: 42 },
      { at: "2026-04-26T14:30:00Z", score: 42 },
    ],
    chartAnnotations: [
      {
        at: "2026-04-26T08:33:00Z",
        label: "Clerk webhook started returning empty user payloads",
        side: "left",
      },
    ],
    anomalies: [
      {
        id: "a1",
        at: "2026-04-26T08:32:00Z",
        severity: "critical",
        summary:
          "Auth success rate dropped from 99.2% to 0%.",
        detail: "No error surfaced to the user. Each run still reports success.",
        suggestedActionId: "pause",
      },
      {
        id: "a2",
        at: "2026-04-26T08:33:00Z",
        severity: "critical",
        summary:
          "Welcome emails skipped silently. 240 missed since the drop.",
        suggestedActionId: "notify-owner",
      },
      {
        id: "a3",
        at: "2026-04-26T08:33:00Z",
        severity: "critical",
        summary:
          "HubSpot contact creation skipped silently. 240 missed since the drop.",
        suggestedActionId: "rollback",
      },
      {
        id: "a4",
        at: "2026-04-25T11:18:00Z",
        severity: "warning",
        summary:
          "Postmark P95 latency rose from 320ms to 510ms.",
        detail: "Returned to baseline within 2 hours. Not currently affecting outputs.",
      },
    ],
  },
  "stripe-slack": {
    score: 99,
    deltaSinceYesterday: 0,
    annotation: "Healthy. No anomalies in the last 7 days.",
    keyStats: [
      { label: "Last run", value: "1m ago", tone: "ok" },
      { label: "Runs (24h)", value: "118" },
      { label: "Failures", value: "0", tone: "ok" },
      { label: "Avg duration", value: "0.6s" },
    ],
    learned: {
      observationWindow: "Calibrated over 30 days from 3,540 historical runs.",
      baselines: [
        {
          metric: "Median duration",
          baseline: "0.6s ± 0.2",
          current: "0.6s",
          deviation: "Within baseline.",
          tone: "ok",
          numeric: {
            scaleMax: 2,
            baselineValue: 0.6,
            baselineRange: [0.4, 0.8],
            currentValue: 0.6,
            unit: "s",
          },
        },
        {
          metric: "Success rate",
          baseline: "100%",
          current: "100%",
          deviation: "Within baseline.",
          tone: "ok",
          numeric: {
            scaleMax: 100,
            baselineValue: 100,
            currentValue: 100,
            unit: "%",
          },
        },
        {
          metric: "Volume per day",
          baseline: "~120 charges/day",
          current: "118 today",
          deviation: "Within baseline.",
          tone: "ok",
          numeric: {
            scaleMax: 200,
            baselineValue: 120,
            baselineRange: [100, 140],
            currentValue: 118,
            unit: "/day",
          },
        },
      ],
    },
    timeline: generateHealthyTimeline(),
    chartAnnotations: [],
    anomalies: [],
  },
  "typeform-notion": {
    score: 92,
    deltaSinceYesterday: -1,
    annotation:
      "Healthy with a planned change ahead. Notion legacy endpoint will be removed in 30 days.",
    keyStats: [
      { label: "Last run", value: "12m ago", tone: "ok" },
      { label: "Runs (24h)", value: "8" },
      { label: "Failures", value: "0", tone: "ok" },
      { label: "Endpoint sunsets in", value: "30 days", tone: "warning" },
    ],
    learned: {
      observationWindow: "Calibrated over 60 days from 480 historical runs.",
      baselines: [
        {
          metric: "Median duration",
          baseline: "1.4s ± 0.3",
          current: "1.4s",
          deviation: "Within baseline.",
          tone: "ok",
        },
        {
          metric: "Success rate",
          baseline: "100%",
          current: "100%",
          deviation: "Within baseline.",
          tone: "ok",
        },
        {
          metric: "Endpoint version",
          baseline: "Notion legacy append API",
          current: "Notion legacy append API",
          deviation: "Endpoint will be removed on May 26.",
          tone: "warning",
        },
      ],
    },
    timeline: generateHealthyTimeline(95, 2),
    chartAnnotations: [],
    anomalies: [
      {
        id: "tn1",
        at: "2026-04-25T11:00:00Z",
        severity: "notice",
        summary:
          "Notion announced deprecation of the legacy database append endpoint used by step 'Append to database'.",
        detail: "Removed on May 26. Migrate to the Data Sources API.",
      },
    ],
  },
  "github-linear": {
    score: 100,
    deltaSinceYesterday: 0,
    annotation: "Healthy. All runs in the last 7 days completed successfully.",
    keyStats: [
      { label: "Last run", value: "3m ago", tone: "ok" },
      { label: "Runs (24h)", value: "27" },
      { label: "Failures", value: "0", tone: "ok" },
      { label: "Avg duration", value: "1.2s" },
    ],
    learned: {
      observationWindow: "Calibrated over 90 days from 2,610 historical runs.",
      baselines: [
        {
          metric: "Median duration",
          baseline: "1.2s ± 0.4",
          current: "1.2s",
          deviation: "Within baseline.",
          tone: "ok",
        },
        {
          metric: "Success rate",
          baseline: "100%",
          current: "100%",
          deviation: "Within baseline.",
          tone: "ok",
        },
      ],
    },
    timeline: generateHealthyTimeline(99),
    chartAnnotations: [],
    anomalies: [],
  },
  "revenue-report": {
    score: 99,
    deltaSinceYesterday: 0,
    annotation: "Healthy. Daily report posted on schedule.",
    keyStats: [
      { label: "Last run", value: "Today 8:00", tone: "ok" },
      { label: "Runs (30d)", value: "30" },
      { label: "Failures", value: "0", tone: "ok" },
      { label: "Avg duration", value: "3.1s" },
    ],
    learned: {
      observationWindow: "Calibrated over 120 days from 120 historical runs.",
      baselines: [
        {
          metric: "Post time",
          baseline: "08:00 PT daily",
          current: "08:00 PT today",
          deviation: "Within baseline.",
          tone: "ok",
        },
        {
          metric: "Median duration",
          baseline: "3.1s ± 0.5",
          current: "3.1s",
          deviation: "Within baseline.",
          tone: "ok",
        },
        {
          metric: "Success rate",
          baseline: "100%",
          current: "100%",
          deviation: "Within baseline.",
          tone: "ok",
        },
      ],
    },
    timeline: generateHealthyTimeline(99),
    chartAnnotations: [],
    anomalies: [],
  },
};

function generateHealthyTimeline(base = 98, jitter = 1): HealthPoint[] {
  const points: HealthPoint[] = [];
  const days = 7;
  const start = new Date("2026-04-20T00:00:00Z").getTime();
  for (let d = 0; d < days; d++) {
    for (const h of [0, 12]) {
      const t = new Date(start + d * 86400000 + h * 3600000);
      const offset = ((d * 7 + h) % 5) - 2;
      points.push({
        at: t.toISOString(),
        score: Math.max(85, Math.min(100, base + offset * jitter)),
      });
    }
  }
  return points;
}

export function getHealth(workflowId: string): WorkflowHealth | undefined {
  return HEALTH[workflowId];
}
