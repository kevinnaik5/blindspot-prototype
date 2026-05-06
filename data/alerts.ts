export type Severity = "critical" | "warning" | "notice";

export type IndicatorTone = "critical" | "warning" | "info" | "muted";

export type AlertIndicator = {
  label: string;
  value: string;
  tone?: IndicatorTone;
};

export type Alert = {
  id: string;
  severity: Severity;
  workflowId: string;
  // Short identifier shown in the card header
  workflowShortName: string;
  workflowName: string;
  detectedAt: string;
  // One-line insight. What is wrong, in plain language.
  title: string;
  // Compact metric rows. Label left, value right.
  indicators: AlertIndicator[];
  // Footer CTA label
  action: string;
};

export const ALERTS: Alert[] = [
  {
    id: "alert-1",
    severity: "critical",
    workflowId: "customer-onboarding",
    workflowShortName: "Customer Onboarding",
    workflowName: "Customer Onboarding → Welcome Email + CRM sync",
    detectedAt: "2026-04-26T08:32:00Z",
    title: "Clerk is returning empty user payloads on success.",
    indicators: [
      { label: "Started", value: "6h ago" },
      { label: "Signups affected", value: "240", tone: "critical" },
      { label: "Welcome emails skipped", value: "240", tone: "critical" },
      { label: "HubSpot records missed", value: "240", tone: "critical" },
    ],
    action: "Investigate",
  },
  {
    id: "alert-2",
    severity: "notice",
    workflowId: "typeform-notion",
    workflowShortName: "Typeform → Notion",
    workflowName: "Typeform submission → Notion + Email",
    detectedAt: "2026-04-25T11:00:00Z",
    title: "Notion is deprecating the legacy database append endpoint.",
    indicators: [
      { label: "Removed in", value: "30 days", tone: "warning" },
      { label: "Affected step", value: "Append to database" },
    ],
    action: "View migration",
  },
];
