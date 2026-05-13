import type { AnomalySeverity } from "@/data/health";
import type { AlertChannel } from "@/data/connections";

export type Workspace = {
  name: string;
  plan: string;
  workflowsUsed: number;
  workflowsLimit: number;
  ownerName: string;
  ownerEmail: string;
};

// Workspace exists at signup. Empty-state defaults reflect a fresh account.
export const WORKSPACE: Workspace = {
  name: "My workspace",
  plan: "Free",
  workflowsUsed: 0,
  workflowsLimit: 5,
  ownerName: "Kevin Naik",
  ownerEmail: "kevin@acme.co",
};

// Reflects the workspace after the demo workflow has been loaded.
export const DEMO_LOADED_WORKSPACE: Workspace = {
  ...WORKSPACE,
  workflowsUsed: 1,
};

export type MemberRole = "owner" | "admin" | "viewer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  lastActiveAt?: string;
};

export const DEMO_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "mira",
    name: "Mira Chen",
    email: "mira@acme.co",
    role: "owner",
    lastActiveAt: "2026-05-13T11:45:00-07:00",
  },
  {
    id: "theo",
    name: "Theo Brandt",
    email: "theo@acme.co",
    role: "admin",
    lastActiveAt: "2026-05-13T09:20:00-07:00",
  },
  {
    id: "priya",
    name: "Priya Shah",
    email: "priya@acme.co",
    role: "admin",
    lastActiveAt: "2026-05-12T16:08:00-07:00",
  },
  {
    id: "jamal",
    name: "Jamal Park",
    email: "jamal@acme.co",
    role: "viewer",
    lastActiveAt: "2026-05-11T10:34:00-07:00",
  },
  {
    id: "sara",
    name: "Sara Oduya",
    email: "sara@acme.co",
    role: "viewer",
  },
];

// First-time experience: only the owner is on the team.
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "kevin",
    name: "Kevin Naik",
    email: "kevin@acme.co",
    role: "owner",
    lastActiveAt: "2026-05-13T12:00:00-07:00",
  },
];

export type AlertRuleStatus = "active" | "off";

export type AlertRule = {
  id: string;
  severity: AnomalySeverity;
  channel: AlertChannel;
  destinationLabel: string;
  cooldownMinutes: number;
  status: AlertRuleStatus;
};

export const DEMO_ALERT_RULES: AlertRule[] = [
  {
    id: "crit-pd",
    severity: "critical",
    channel: "pagerduty",
    destinationLabel: "PagerDuty · ops on-call",
    cooldownMinutes: 5,
    status: "active",
  },
  {
    id: "crit-slack",
    severity: "critical",
    channel: "slack",
    destinationLabel: "Slack · #ops-alerts",
    cooldownMinutes: 5,
    status: "active",
  },
  {
    id: "warn-slack",
    severity: "warning",
    channel: "slack",
    destinationLabel: "Slack · #ops-alerts",
    cooldownMinutes: 15,
    status: "active",
  },
  {
    id: "notice-email",
    severity: "notice",
    channel: "email",
    destinationLabel: "Email · ops@acme.co",
    cooldownMinutes: 60,
    status: "active",
  },
  {
    id: "notice-teams",
    severity: "notice",
    channel: "teams",
    destinationLabel: "Microsoft Teams · Operations",
    cooldownMinutes: 60,
    status: "off",
  },
];

export const ALERT_RULES: AlertRule[] = [];

// Minimal rules surfaced alongside the demo workflow so the alerts coming
// off it actually have somewhere to land.
export const DEMO_LOADED_ALERT_RULES: AlertRule[] = [
  {
    id: "crit-slack",
    severity: "critical",
    channel: "slack",
    destinationLabel: "Slack · #ops-alerts",
    cooldownMinutes: 5,
    status: "active",
  },
  {
    id: "warn-email",
    severity: "warning",
    channel: "email",
    destinationLabel: "Email · ops@acme.co",
    cooldownMinutes: 30,
    status: "active",
  },
];
