export type StepBarStatus = "ok" | "warning" | "error" | "skipped";

export type StepBar = {
  stepId: string;
  // ms from run start
  startMs: number;
  durationMs: number;
  status: StepBarStatus;
};

export type RunStatus = "success" | "silent-failure" | "failed";

export type Run = {
  id: string;
  // Run number for human reference
  number: number;
  startedAt: string;
  totalMs: number;
  status: RunStatus;
  // One-line plain-language summary used in Run history rows
  summary: string;
  steps: StepBar[];
};

// Generates a silent-failure run for the customer-onboarding scenario.
// Trigger returns 200 with an empty user, downstream steps skip in a few ms.
function silentFailureRun(num: number, at: string, jitter = 0): Run {
  const triggerMs = 168 + jitter;
  const formatStart = triggerMs + 3;
  const formatMs = 36 + (jitter % 6);
  const fanStart = formatStart + formatMs + 2;
  const emailMs = 3 + (jitter % 3);
  const crmMs = 4 + ((jitter + 1) % 4);
  const notifyStart = fanStart + Math.max(emailMs, crmMs) + 2;
  const notifyMs = 50 + (jitter % 7);
  const total = notifyStart + notifyMs;
  return {
    id: `run-${num}`,
    number: num,
    startedAt: at,
    totalMs: total,
    status: "silent-failure",
    summary: "Reported success but produced empty payload",
    steps: [
      { stepId: "trigger", startMs: 0, durationMs: triggerMs, status: "warning" },
      { stepId: "format", startMs: formatStart, durationMs: formatMs, status: "ok" },
      { stepId: "email", startMs: fanStart, durationMs: emailMs, status: "error" },
      { stepId: "crm", startMs: fanStart, durationMs: crmMs, status: "error" },
      { stepId: "notify", startMs: notifyStart, durationMs: notifyMs, status: "ok" },
    ],
  };
}

// Healthy run before the incident. Email + HubSpot fan out and take real time.
function successRun(num: number, at: string, jitter = 0): Run {
  const triggerMs = 210 + (jitter % 12);
  const formatStart = triggerMs + 3;
  const formatMs = 58 + (jitter % 8);
  const fanStart = formatStart + formatMs + 2;
  const emailMs = 380 + (jitter % 30);
  const crmMs = 285 + (jitter % 25);
  const notifyStart = fanStart + Math.max(emailMs, crmMs) + 4;
  const notifyMs = 45 + (jitter % 8);
  const total = notifyStart + notifyMs;
  return {
    id: `run-${num}`,
    number: num,
    startedAt: at,
    totalMs: total,
    status: "success",
    summary: "Welcome email sent, contact created in HubSpot",
    steps: [
      { stepId: "trigger", startMs: 0, durationMs: triggerMs, status: "ok" },
      { stepId: "format", startMs: formatStart, durationMs: formatMs, status: "ok" },
      { stepId: "email", startMs: fanStart, durationMs: emailMs, status: "ok" },
      { stepId: "crm", startMs: fanStart, durationMs: crmMs, status: "ok" },
      { stepId: "notify", startMs: notifyStart, durationMs: notifyMs, status: "ok" },
    ],
  };
}

const customerOnboardingRuns: Run[] = [
  silentFailureRun(1023, "2026-04-26T14:26:00Z", 5),
  silentFailureRun(1022, "2026-04-26T14:11:00Z", 3),
  silentFailureRun(1021, "2026-04-26T13:55:00Z", -2),
  silentFailureRun(1020, "2026-04-26T13:40:00Z", 7),
  silentFailureRun(1019, "2026-04-26T13:24:00Z", 1),
  silentFailureRun(1018, "2026-04-26T13:08:00Z", -4),
  silentFailureRun(1017, "2026-04-26T12:53:00Z", 6),
  silentFailureRun(1016, "2026-04-26T12:37:00Z", 2),
  silentFailureRun(1015, "2026-04-26T12:21:00Z", -1),
  silentFailureRun(1014, "2026-04-26T12:05:00Z", 8),
  silentFailureRun(1013, "2026-04-26T11:50:00Z", 4),
  silentFailureRun(1012, "2026-04-26T11:34:00Z", -3),
  silentFailureRun(1011, "2026-04-26T11:18:00Z", 9),
  silentFailureRun(1010, "2026-04-26T11:02:00Z", 0),
  silentFailureRun(1009, "2026-04-26T10:47:00Z", 5),
  silentFailureRun(1008, "2026-04-26T10:31:00Z", -2),
  silentFailureRun(1007, "2026-04-26T10:15:00Z", 7),
  silentFailureRun(1006, "2026-04-26T09:59:00Z", 3),
  silentFailureRun(1005, "2026-04-26T09:44:00Z", -1),
  silentFailureRun(1004, "2026-04-26T09:28:00Z", 6),
  silentFailureRun(1003, "2026-04-26T09:12:00Z", 2),
  silentFailureRun(1002, "2026-04-26T08:48:00Z", 4),
  // First silent failure
  {
    ...silentFailureRun(1001, "2026-04-26T08:32:00Z", 8),
    summary: "First silent failure: Clerk webhook returned 200 with empty user payload",
  },
  // Healthy runs from before the incident
  successRun(1000, "2026-04-26T08:15:00Z", 4),
  successRun(999, "2026-04-26T07:42:00Z", -8),
  successRun(998, "2026-04-26T07:14:00Z", 12),
  successRun(997, "2026-04-26T06:50:00Z", -2),
  successRun(996, "2026-04-26T05:30:00Z", 15),
  successRun(995, "2026-04-25T23:42:00Z", -5),
  successRun(994, "2026-04-25T22:15:00Z", 8),
];

const RUNS: Record<string, Run[]> = {
  "customer-onboarding": customerOnboardingRuns,
};

export function getRuns(workflowId: string): Run[] {
  return RUNS[workflowId] ?? [];
}
