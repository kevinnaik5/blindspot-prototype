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

export const WORKSPACE: Workspace = {
  name: "Acme Ops",
  plan: "Pro",
  workflowsUsed: 12,
  workflowsLimit: 25,
  ownerName: "Mira Chen",
  ownerEmail: "mira@acme.co",
};

export type MemberRole = "owner" | "admin" | "viewer";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  lastActiveAt?: string;
};

export const TEAM_MEMBERS: TeamMember[] = [
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

export type AlertRuleStatus = "active" | "off";

export type AlertRule = {
  id: string;
  severity: AnomalySeverity;
  channel: AlertChannel;
  destinationLabel: string;
  cooldownMinutes: number;
  status: AlertRuleStatus;
};

export const ALERT_RULES: AlertRule[] = [
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
