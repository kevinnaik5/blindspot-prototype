"use client";

import {
  Bell,
  Briefcase,
  Hash,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  ALERT_RULES,
  DEMO_LOADED_ALERT_RULES,
  DEMO_LOADED_WORKSPACE,
  TEAM_MEMBERS,
  WORKSPACE,
  type AlertRule,
  type AlertRuleStatus,
  type MemberRole,
  type TeamMember,
  type Workspace,
} from "@/data/settings";
import type { AnomalySeverity } from "@/data/health";
import type { AlertChannel } from "@/data/connections";
import { relativeFromNow } from "@/lib/time";
import { useDemoLoaded } from "@/lib/demo";
import { SectionHeading } from "@/components/section-label";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<MemberRole, string> = {
  owner: "Owner",
  admin: "Admin",
  viewer: "Viewer",
};

const ROLE_TONE: Record<MemberRole, string> = {
  owner: "bg-info/15 text-info",
  admin: "bg-panel-2 text-fg",
  viewer: "bg-panel-2 text-muted",
};

const SEVERITY_META: Record<
  AnomalySeverity,
  { label: string; dot: string; text: string }
> = {
  critical: { label: "Critical", dot: "bg-critical", text: "text-critical" },
  warning: { label: "Warning", dot: "bg-warning", text: "text-warning" },
  notice: { label: "Notice", dot: "bg-info", text: "text-info" },
};

const CHANNEL_ICON: Record<AlertChannel, LucideIcon> = {
  slack: Hash,
  teams: MessageSquare,
  email: Mail,
  pagerduty: Bell,
  sms: Phone,
};

const STATUS_META: Record<AlertRuleStatus, { label: string; tone: string }> = {
  active: { label: "Active", tone: "text-ok" },
  off: { label: "Off", tone: "text-subtle" },
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-8 pt-8 pb-16">
      {/* Eyebrow */}
      <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        Manage
      </div>

      {/* Header */}
      <div className="mt-3 border-b border-border pb-6">
        <h1 className="text-[28px] font-medium leading-[1.2] tracking-tightish text-fg">
          Workspace, team, and alerts
        </h1>
        <p className="mt-2 max-w-[680px] text-[12px] leading-[1.55] text-muted">
          Manage who can see this workspace and where Blindspot routes
          alerts when something needs attention.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <WorkspaceSection />
        <TeamSection />
        <AlertRoutingSection />
      </div>
    </div>
  );
}

// --- Workspace card ---

function WorkspaceSection() {
  const demoLoaded = useDemoLoaded();
  const ws: Workspace = demoLoaded ? DEMO_LOADED_WORKSPACE : WORKSPACE;
  const pct = Math.round((ws.workflowsUsed / ws.workflowsLimit) * 100);
  return (
    <section>
      <SectionHeading icon={Briefcase}>Workspace</SectionHeading>
      <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
        <SettingsRow label="Workspace name" value={ws.name} />
        <SettingsRow
          label="Plan"
          rightSlot={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-info/15 px-2 py-0.5 text-[12px] font-medium text-info">
              {ws.plan}
            </span>
          }
        />
        <SettingsRow
          label="Workflows"
          rightSlot={
            <div className="flex items-center gap-3">
              <span className="text-[12px] tabular-nums text-fg">
                {ws.workflowsUsed} / {ws.workflowsLimit}
              </span>
              <div className="h-1.5 w-[120px] overflow-hidden rounded-sm bg-panel-2">
                <div
                  className="h-full bg-info-solid"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          }
        />
        <SettingsRow
          label="Owner"
          value={`${ws.ownerName} · ${ws.ownerEmail}`}
          last
        />
      </div>
    </section>
  );
}

function SettingsRow({
  label,
  value,
  rightSlot,
  last,
}: {
  label: string;
  value?: string;
  rightSlot?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-5 py-3",
        !last && "border-b border-border",
      )}
    >
      <span className="text-[12px] text-muted">{label}</span>
      {rightSlot ?? (
        <span className="text-[12px] font-medium text-fg">{value}</span>
      )}
    </div>
  );
}

// --- Team members table ---

function TeamSection() {
  return (
    <section>
      <SectionHeading
        icon={Users}
        trailing={
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Invite member
          </button>
        }
      >
        Team members
      </SectionHeading>

      <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
        <div className="grid grid-cols-[minmax(0,1.6fr)_140px_140px_120px] items-center gap-4 border-b border-border bg-panel-2 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
          <div>Member</div>
          <div>Role</div>
          <div>Last active</div>
          <div className="text-right">Action</div>
        </div>
        <ul className="divide-y divide-border">
          {TEAM_MEMBERS.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function MemberRow({ member: m }: { member: TeamMember }) {
  return (
    <li className="grid grid-cols-[minmax(0,1.6fr)_140px_140px_120px] items-center gap-4 px-5 py-3 text-[12px]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel-2 text-[12px] font-medium text-muted">
          {initials(m.name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-fg">{m.name}</div>
          <div className="mt-0.5 truncate text-[12px] text-subtle">
            {m.email}
          </div>
        </div>
      </div>
      <div>
        <span
          className={cn(
            "inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-medium",
            ROLE_TONE[m.role],
          )}
        >
          {ROLE_LABEL[m.role]}
        </span>
      </div>
      <div className="tabular-nums text-muted">
        {m.lastActiveAt ? relativeFromNow(m.lastActiveAt) : "Pending invite"}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={m.role === "owner"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium transition-colors",
            m.role === "owner"
              ? "cursor-not-allowed text-subtle"
              : "text-fg hover:bg-border-strong",
          )}
        >
          Manage
        </button>
      </div>
    </li>
  );
}

// --- Alert routing rules ---

function AlertRoutingSection() {
  const demoLoaded = useDemoLoaded();
  const rules: AlertRule[] = demoLoaded ? DEMO_LOADED_ALERT_RULES : ALERT_RULES;
  return (
    <section>
      <SectionHeading
        icon={Bell}
        trailing={
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
          >
            <Plus className="h-3 w-3" strokeWidth={2} />
            Add rule
          </button>
        }
      >
        Alert routing
      </SectionHeading>

      {rules.length === 0 ? (
        <div className="mt-3 rounded-[6px] border border-dashed border-border-strong bg-panel p-8">
          <div className="mx-auto flex max-w-[440px] flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-panel-2 text-muted">
              <Bell className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-[16px] font-medium tracking-tightish text-fg">
              No routing rules yet
            </h3>
            <p className="mt-1.5 text-[12px] leading-[1.55] text-muted">
              Decide which severities go to which destinations. Add a
              destination on the Connections page first if you haven&apos;t.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
            >
              <Plus className="h-3 w-3" strokeWidth={2} />
              Add your first rule
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
          <div className="grid grid-cols-[140px_minmax(0,1.4fr)_120px_120px_120px] items-center gap-4 border-b border-border bg-panel-2 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
            <div>Severity</div>
            <div>Destination</div>
            <div>Cooldown</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>
          <ul className="divide-y divide-border">
            {rules.map((r) => (
              <AlertRuleRow key={r.id} rule={r} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function AlertRuleRow({ rule: r }: { rule: AlertRule }) {
  const sev = SEVERITY_META[r.severity];
  const Icon = CHANNEL_ICON[r.channel];
  const status = STATUS_META[r.status];
  return (
    <li className="grid grid-cols-[140px_minmax(0,1.4fr)_120px_120px_120px] items-center gap-4 px-5 py-3 text-[12px]">
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", sev.dot)} />
        <span className={cn("font-medium", sev.text)}>{sev.label}</span>
      </div>
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-panel-2 text-muted">
          <Icon className="h-3 w-3" strokeWidth={1.85} />
        </div>
        <span className="truncate text-fg">{r.destinationLabel}</span>
      </div>
      <div className="tabular-nums text-muted">{r.cooldownMinutes} min</div>
      <div className={cn("font-medium", status.tone)}>{status.label}</div>
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border-strong"
        >
          Edit
        </button>
      </div>
    </li>
  );
}
