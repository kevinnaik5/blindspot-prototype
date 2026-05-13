import type { Platform } from "@/data/workflows";

export type ConnectionStatus = "connected" | "disconnected" | "needs-reauth";

export type SourceConnection = {
  id: string;
  platform: Platform;
  status: ConnectionStatus;
  workflowsImported: number;
  lastSyncAt?: string;
  detail?: string;
};

export type AlertChannel =
  | "slack"
  | "teams"
  | "email"
  | "pagerduty"
  | "sms";

export type AlertStatus = "active" | "inactive" | "needs-setup";

export type AlertDestination = {
  id: string;
  channel: AlertChannel;
  name: string;
  status: AlertStatus;
  lastNotifiedAt?: string;
  detail?: string;
};

export const SOURCES: SourceConnection[] = [
  {
    id: "zapier",
    platform: "zapier",
    status: "connected",
    workflowsImported: 4,
    lastSyncAt: "2026-05-13T11:32:00-07:00",
    detail: "Workspace: Acme Ops",
  },
  {
    id: "n8n",
    platform: "n8n",
    status: "needs-reauth",
    workflowsImported: 2,
    lastSyncAt: "2026-05-12T09:14:00-07:00",
    detail: "Token expired 4 hours ago",
  },
  {
    id: "make",
    platform: "make",
    status: "connected",
    workflowsImported: 1,
    lastSyncAt: "2026-05-13T08:00:00-07:00",
    detail: "Team: Acme Growth",
  },
  {
    id: "workato",
    platform: "workato",
    status: "disconnected",
    workflowsImported: 0,
  },
  {
    id: "pipedream",
    platform: "pipedream",
    status: "disconnected",
    workflowsImported: 0,
  },
];

export const ALERT_DESTINATIONS: AlertDestination[] = [
  {
    id: "slack",
    channel: "slack",
    name: "Slack",
    status: "active",
    lastNotifiedAt: "2026-05-13T09:34:00-07:00",
    detail: "#ops-alerts",
  },
  {
    id: "email",
    channel: "email",
    name: "Email",
    status: "active",
    lastNotifiedAt: "2026-05-13T08:32:00-07:00",
    detail: "ops@acme.co",
  },
  {
    id: "pagerduty",
    channel: "pagerduty",
    name: "PagerDuty",
    status: "needs-setup",
    detail: "Critical alerts only",
  },
  {
    id: "teams",
    channel: "teams",
    name: "Microsoft Teams",
    status: "inactive",
  },
  {
    id: "sms",
    channel: "sms",
    name: "SMS",
    status: "inactive",
  },
];
