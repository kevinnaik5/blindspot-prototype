import { Settings as SettingsIcon, User } from "lucide-react";
import { SectionHeading } from "@/components/section-label";

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-8 pt-8 pb-16">
      {/* Eyebrow */}
      <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        Settings
      </div>

      {/* Header */}
      <div className="mt-3 border-b border-border pb-6">
        <h1 className="text-[28px] font-medium leading-[1.2] tracking-tightish text-fg">
          Account settings
        </h1>
        <p className="mt-2 max-w-[680px] text-[12px] leading-[1.55] text-muted">
          Your personal profile and notification preferences. Workspace-level
          settings (team, alert routing) live under Manage.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <section>
          <SectionHeading icon={User}>Profile</SectionHeading>
          <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            <Row label="Name" value="Kevin Naik" />
            <Row label="Email" value="kevin@acme.co" />
            <Row label="Timezone" value="America/Los_Angeles" />
            <Row label="Theme" value="Dark" last />
          </div>
        </section>

        <section>
          <SectionHeading icon={SettingsIcon}>Notifications</SectionHeading>
          <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            <Row
              label="Critical incidents"
              value="Slack DM · ops@acme.co"
            />
            <Row label="Weekly digest" value="Email · Mondays at 9:00 AM" />
            <Row label="Mentions" value="Slack · in-app" last />
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={
        last
          ? "flex items-center justify-between gap-4 px-5 py-3"
          : "flex items-center justify-between gap-4 border-b border-border px-5 py-3"
      }
    >
      <span className="text-[12px] text-muted">{label}</span>
      <span className="text-[12px] font-medium text-fg">{value}</span>
    </div>
  );
}
