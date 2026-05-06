export type StepInput = {
  label: string;
  value: string;
  // Render value as a redacted/secret token
  secret?: boolean;
};

export type StepConfig = { label: string; value: string };

export type StepExecutionStatus = "ok" | "warning" | "error";

export type StepExecution = {
  at: string;
  status: StepExecutionStatus;
  // Short plain-language line on what happened on this run
  detail: string;
  // Optional flag for the very first occurrence of the current incident
  firstFailure?: boolean;
};

export type StepDetails = {
  inputs: StepInput[];
  output: {
    received: string;
    expected?: string;
  };
  config: StepConfig[];
  recent: StepExecution[];
};

// Keyed by `${workflowId}/${stepId}`. Steps without an entry render a fallback.
const DETAILS: Record<string, StepDetails> = {
  "customer-onboarding/trigger": {
    inputs: [
      {
        label: "Webhook URL",
        value: "https://acme.com/api/webhooks/clerk",
      },
      { label: "Signing secret", value: "whsec_••••••••••", secret: true },
    ],
    output: {
      received: `{
  "user": {}
}`,
      expected: `{
  "user": {
    "id": "user_2nQjK9...",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Doe"
  }
}`,
    },
    config: [
      { label: "Trigger event", value: "user.created" },
      { label: "Verify signature", value: "Yes" },
      { label: "Retry on fail", value: "3 times" },
    ],
    recent: [
      {
        at: "2026-04-26T14:26:00Z",
        status: "warning",
        detail: "200 OK, empty payload",
      },
      {
        at: "2026-04-26T14:22:00Z",
        status: "warning",
        detail: "200 OK, empty payload",
      },
      {
        at: "2026-04-26T14:18:00Z",
        status: "warning",
        detail: "200 OK, empty payload",
      },
      {
        at: "2026-04-26T13:55:00Z",
        status: "warning",
        detail: "200 OK, empty payload",
      },
      {
        at: "2026-04-26T13:12:00Z",
        status: "warning",
        detail: "200 OK, empty payload",
      },
      {
        at: "2026-04-26T08:32:00Z",
        status: "warning",
        detail: "200 OK, empty payload",
        firstFailure: true,
      },
      {
        at: "2026-04-26T08:15:00Z",
        status: "ok",
        detail: "200 OK, full payload",
      },
      {
        at: "2026-04-26T07:42:00Z",
        status: "ok",
        detail: "200 OK, full payload",
      },
    ],
  },
  "customer-onboarding/format": {
    inputs: [{ label: "Source", value: "{{trigger.user}}" }],
    output: {
      received: `{
  "email": null,
  "name": null,
  "id": null
}`,
      expected: `{
  "email": "jane@example.com",
  "name": "Jane Doe",
  "id": "user_2nQjK9..."
}`,
    },
    config: [
      { label: "Language", value: "JavaScript" },
      { label: "Sandboxed", value: "Yes" },
      { label: "Timeout", value: "5s" },
    ],
    recent: [
      {
        at: "2026-04-26T14:26:00Z",
        status: "ok",
        detail: "Ran in 8ms (output null fields)",
      },
      {
        at: "2026-04-26T14:22:00Z",
        status: "ok",
        detail: "Ran in 7ms (output null fields)",
      },
      {
        at: "2026-04-26T13:55:00Z",
        status: "ok",
        detail: "Ran in 9ms (output null fields)",
      },
      {
        at: "2026-04-26T08:15:00Z",
        status: "ok",
        detail: "Ran in 8ms",
      },
      {
        at: "2026-04-26T07:42:00Z",
        status: "ok",
        detail: "Ran in 8ms",
      },
    ],
  },
  "customer-onboarding/email": {
    inputs: [
      { label: "To", value: "{{format.email}}" },
      { label: "Template ID", value: "tmpl_welcome_v3" },
      { label: "From", value: "hi@acme.co" },
      { label: "Subject", value: "Welcome to Acme" },
    ],
    output: {
      received: `{
  "skipped": true,
  "reason": "missing email field"
}`,
      expected: `{
  "messageId": "msg_abc123",
  "to": "jane@example.com",
  "submittedAt": "2026-04-26T14:26:01Z"
}`,
    },
    config: [
      { label: "On error", value: "Skip step" },
      { label: "Stream", value: "transactional" },
    ],
    recent: [
      {
        at: "2026-04-26T14:26:00Z",
        status: "error",
        detail: "Skipped, no email field",
      },
      {
        at: "2026-04-26T14:22:00Z",
        status: "error",
        detail: "Skipped, no email field",
      },
      {
        at: "2026-04-26T13:55:00Z",
        status: "error",
        detail: "Skipped, no email field",
      },
      {
        at: "2026-04-26T13:12:00Z",
        status: "error",
        detail: "Skipped, no email field",
      },
      {
        at: "2026-04-26T08:32:00Z",
        status: "error",
        detail: "Skipped, no email field",
        firstFailure: true,
      },
      {
        at: "2026-04-26T08:15:00Z",
        status: "ok",
        detail: "Sent to jane@example.com",
      },
      {
        at: "2026-04-26T07:42:00Z",
        status: "ok",
        detail: "Sent to john@example.com",
      },
    ],
  },
  "customer-onboarding/crm": {
    inputs: [
      { label: "Email", value: "{{format.email}}" },
      { label: "Name", value: "{{format.name}}" },
      { label: "Source", value: "signup" },
      { label: "Lifecycle stage", value: "lead" },
    ],
    output: {
      received: `{
  "skipped": true,
  "reason": "missing email field"
}`,
      expected: `{
  "contactId": "1234567",
  "email": "jane@example.com"
}`,
    },
    config: [
      { label: "On duplicate", value: "Update existing" },
      { label: "Lifecycle stage", value: "lead" },
    ],
    recent: [
      {
        at: "2026-04-26T14:26:00Z",
        status: "error",
        detail: "Skipped, no email field",
      },
      {
        at: "2026-04-26T14:22:00Z",
        status: "error",
        detail: "Skipped, no email field",
      },
      {
        at: "2026-04-26T08:32:00Z",
        status: "error",
        detail: "Skipped, no email field",
        firstFailure: true,
      },
      {
        at: "2026-04-26T08:15:00Z",
        status: "ok",
        detail: "Created contact 1234567",
      },
    ],
  },
  "customer-onboarding/notify": {
    inputs: [
      { label: "Channel", value: "#signups" },
      {
        label: "Message",
        value: "New signup: {{format.name}} ({{format.email}})",
      },
    ],
    output: {
      received: `{
  "ok": true,
  "ts": "1714138...",
  "message": "New signup:  ()"
}`,
      expected: `{
  "ok": true,
  "ts": "1714138...",
  "message": "New signup: Jane Doe (jane@example.com)"
}`,
    },
    config: [{ label: "Bot user", value: "@blindspot-bot" }],
    recent: [
      {
        at: "2026-04-26T14:26:00Z",
        status: "ok",
        detail: "Posted: 'New signup:  ()'",
      },
      {
        at: "2026-04-26T14:22:00Z",
        status: "ok",
        detail: "Posted: 'New signup:  ()'",
      },
      {
        at: "2026-04-26T08:15:00Z",
        status: "ok",
        detail: "Posted: 'New signup: Jane Doe (jane@example.com)'",
      },
    ],
  },
};

export function getStepDetails(
  workflowId: string,
  stepId: string,
): StepDetails | undefined {
  return DETAILS[`${workflowId}/${stepId}`];
}
