"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Workflow as WorkflowIcon,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  History,
  PanelRightClose,
  PanelRightOpen,
  type LucideIcon,
} from "lucide-react";
import {
  ALERTS,
  DEMO_LOADED_ALERTS,
  type Alert,
  type IndicatorTone,
} from "@/data/alerts";
import {
  WORKFLOWS,
  DEMO_LOADED_WORKFLOWS,
  type Workflow,
  type WorkflowChange,
} from "@/data/workflows";
import { NOW, relativeFromNow } from "@/lib/time";
import { SectionHeading } from "@/components/section-label";
import { SeverityBar, SeverityIcon } from "@/components/severity-bar";
import { WorkflowList } from "@/components/workflow-list";
import { QuickStart } from "@/components/quick-start";
import { useDemoLoaded, setDemoLoaded } from "@/lib/demo";
import { cn } from "@/lib/utils";

// A workflow change enriched with the originating workflow's name + id
// so the Recent activity feed can link to the right detail page.
type ActivityEntry = WorkflowChange & {
  workflowId: string;
  workflowShortName: string;
};

function shortenWorkflowName(name: string): string {
  // "Customer Onboarding → Welcome Email + CRM sync" → "Customer Onboarding"
  return name.split(/\s+(?:→|->)\s+/)[0];
}

const TONE_TEXT: Record<IndicatorTone, string> = {
  critical: "text-critical",
  warning: "text-warning",
  info: "text-info",
  muted: "text-muted",
};

// Critical-only hero treatment. Severity-keyed visuals so the card
// reads loud against the rest of the page.
const SEVERITY_CARD: Record<
  Alert["severity"],
  {
    border: string;
    bg: string;
    accent: string;
    button: string;
    divider: string;
  }
> = {
  critical: {
    border: "border-critical/40",
    bg: "bg-critical/6",
    accent: "ring-1 ring-critical/15",
    button: "bg-critical-solid text-fg hover:bg-critical-solid/85",
    divider: "border-critical/15",
  },
  warning: {
    border: "border-warning/40",
    bg: "bg-warning/6",
    accent: "ring-1 ring-warning/15",
    button: "bg-warning-solid text-fg hover:bg-warning-solid/85",
    divider: "border-warning/15",
  },
  notice: {
    border: "border-info/35",
    bg: "bg-info/4",
    accent: "",
    button: "bg-info-solid text-fg hover:bg-info-solid/85",
    divider: "border-info/15",
  },
};

export default function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const demoLoaded = useDemoLoaded();

  // When the demo workflow is loaded, surface only that workflow + its
  // alerts. The rest of DEMO_WORKFLOWS / DEMO_ALERTS stays out so the
  // empty-state experience for connections, manage, etc. remains clean.
  const workflows: Workflow[] = demoLoaded ? DEMO_LOADED_WORKFLOWS : WORKFLOWS;
  const alerts: Alert[] = demoLoaded ? DEMO_LOADED_ALERTS : ALERTS;

  const today = NOW.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const counts = {
    healthy: workflows.filter((w) => w.status === "healthy").length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    notice: alerts.filter((a) => a.severity === "notice").length,
  };
  const needsAttention = workflows.length - counts.healthy;

  // Only critical alerts get the hero band, notices stay in the
  // sidebar's "Heads up" panel so they're visible without being loud.
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const nonCriticalAlerts = alerts.filter((a) => a.severity !== "critical");

  // Cross-workflow change feed for the sidebar's Recent activity panel.
  const recentActivity: ActivityEntry[] = workflows.flatMap((w) =>
    w.changes.map((c) => ({
      ...c,
      workflowId: w.id,
      workflowShortName: shortenWorkflowName(w.name),
    })),
  )
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 4);

  return (
    <div
      className={cn(
        "grid min-h-screen grid-cols-1 transition-[grid-template-columns] duration-200",
        sidebarCollapsed
          ? "xl:grid-cols-[minmax(0,1fr)_52px]"
          : "xl:grid-cols-[minmax(0,1fr)_360px]",
      )}
    >
      {/* Main column */}
      <div className="min-w-0 px-8 pt-8 pb-16">
        {/* Eyebrow */}
        <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
          Home
        </div>

        {/* Quick start, onboarding panel, dismissible */}
        <QuickStart />

        {/* Needs attention, critical only */}
        {criticalAlerts.length > 0 && (
          <section className="mt-12">
            <SectionHeading
              icon={AlertTriangle}
              trailing={
                <span className="tabular-nums">
                  {criticalAlerts.length}{" "}
                  {criticalAlerts.length === 1
                    ? "workflow needs"
                    : "workflows need"}{" "}
                  attention
                </span>
              }
            >
              Needs attention
            </SectionHeading>
            <div className="mt-4 space-y-3">
              {criticalAlerts.map((alert) => (
                <AlertHeroCard key={alert.id} alert={alert} />
              ))}
            </div>
          </section>
        )}

        {/* All workflows */}
        <section className="mt-12">
          {workflows.length === 0 ? (
            <>
              <SectionHeading icon={WorkflowIcon}>All workflows</SectionHeading>
              <EmptyWorkflowsHero />
            </>
          ) : (
            <>
              <SectionHeading
                icon={WorkflowIcon}
                trailing={
                  <Link
                    href="/workflows"
                    className="text-muted transition-colors hover:text-fg"
                  >
                    View all
                  </Link>
                }
              >
                All workflows
              </SectionHeading>
              <div className="mt-3">
                <WorkflowList workflows={workflows} />
              </div>
            </>
          )}
        </section>
      </div>

      {/* Side panel */}
      <aside className="border-t border-border bg-panel xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-l xl:border-t-0">
        {/* Collapse toggle, always at top */}
        <div
          className={cn(
            "flex shrink-0",
            sidebarCollapsed
              ? "justify-center pt-4 pb-3"
              : "justify-start px-6 pt-6 pb-1",
          )}
        >
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label={sidebarCollapsed ? "Expand panel" : "Collapse panel"}
            title={sidebarCollapsed ? "Expand panel" : "Collapse panel"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-panel-2 hover:text-fg"
          >
            {sidebarCollapsed ? (
              <PanelRightOpen className="h-4 w-4" strokeWidth={1.85} />
            ) : (
              <PanelRightClose className="h-4 w-4" strokeWidth={1.85} />
            )}
          </button>
        </div>

        {sidebarCollapsed ? (
          <div className="flex flex-col items-stretch gap-1.5 px-1.5 pb-6">
            <RailChip
              Icon={CheckCircle2}
              count={counts.healthy}
              toneBg="bg-ok/25"
              toneText="text-ok"
              title="Healthy"
              onClick={() => setSidebarCollapsed(false)}
            />
            <RailChip
              Icon={AlertCircle}
              count={counts.critical}
              toneBg="bg-critical/25"
              toneText="text-critical"
              title="Critical"
              onClick={() => setSidebarCollapsed(false)}
            />
            <RailChip
              Icon={Info}
              count={counts.notice}
              toneBg="bg-info/25"
              toneText="text-info"
              title="Notice"
              onClick={() => setSidebarCollapsed(false)}
            />

            {(nonCriticalAlerts.length > 0 || recentActivity.length > 0) && (
              <div className="my-1.5 border-t border-border" />
            )}

            {nonCriticalAlerts.length > 0 && (
              <RailChip
                Icon={Info}
                count={nonCriticalAlerts.length}
                toneBg="bg-panel-2"
                toneText="text-muted"
                title="Heads up"
                onClick={() => setSidebarCollapsed(false)}
              />
            )}

            {recentActivity.length > 0 && (
              <RailChip
                Icon={History}
                count={recentActivity.length}
                toneBg="bg-panel-2"
                toneText="text-muted"
                title="Recent activity"
                onClick={() => setSidebarCollapsed(false)}
              />
            )}
          </div>
        ) : (
        <div className="space-y-7 px-6 pt-2 pb-8">
          {/* Status card */}
          <div className="overflow-hidden rounded-[6px] border border-border bg-bg">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="flex items-center gap-2 text-[12px] font-medium tracking-tightish text-fg">
                <Activity
                  className="h-3.5 w-3.5 text-muted"
                  strokeWidth={1.75}
                />
                <span>Status</span>
              </h3>
              <span className="text-[12px] text-subtle">{today}</span>
            </div>
            <div className="px-4 pt-4 pb-3">
              <p className="text-[12px] leading-[1.55] text-fg">
                {workflows.length === 0 ? (
                  <span className="text-muted">
                    No workflows connected yet. Add one to start seeing
                    health signals here.
                  </span>
                ) : (
                  <>
                    {workflows.length} workflows are connected.{" "}
                    {needsAttention > 0 ? (
                      <>
                        <span className="text-critical">
                          {needsAttention}{" "}
                          {needsAttention === 1 ? "needs" : "need"} attention
                        </span>
                        ; the other {counts.healthy} are running normally.
                      </>
                    ) : (
                      <span className="text-ok">All healthy.</span>
                    )}
                  </>
                )}
              </p>
            </div>
            <div className="border-t border-border">
              <Indicator
                label="Healthy"
                count={counts.healthy}
                Icon={CheckCircle2}
                tone="text-ok"
                toneBg="bg-ok/25"
              />
              <Indicator
                label="Critical"
                count={counts.critical}
                Icon={AlertCircle}
                tone="text-critical"
                toneBg="bg-critical/25"
              />
              <Indicator
                label="Notice"
                count={counts.notice}
                Icon={Info}
                tone="text-info"
                toneBg="bg-info/25"
              />
            </div>
          </div>

          {/* Heads up, non-critical alerts (deprecations, drift, etc.) */}
          {nonCriticalAlerts.length > 0 && (
            <section>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] text-fg">
                  <Info className="h-3 w-3" strokeWidth={1.95} />
                  Heads up
                </h3>
                <span className="text-[12px] tabular-nums text-subtle">
                  {nonCriticalAlerts.length}
                </span>
              </div>
              <ul className="mt-2.5 space-y-2">
                {nonCriticalAlerts.map((alert) => (
                  <li key={alert.id}>
                    <Link
                      href={`/workflows/${alert.workflowId}`}
                      className="group block overflow-hidden rounded-[6px] border border-info/35 bg-info/8 transition-colors hover:border-info/55 hover:bg-info/12"
                    >
                      <div className="px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12px] font-medium text-fg">
                            {alert.workflowShortName}
                          </span>
                          <span className="shrink-0 text-[12px] text-subtle">
                            {relativeFromNow(alert.detectedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] leading-[1.5] text-muted">
                          {alert.title}
                        </p>
                        {alert.indicators[0] && (
                          <div className="mt-1.5 flex items-baseline gap-1.5 text-[12px]">
                            <span className="text-subtle">
                              {alert.indicators[0].label}:
                            </span>
                            <span
                              className={cn(
                                "font-medium tabular-nums",
                                alert.indicators[0].tone
                                  ? TONE_TEXT[alert.indicators[0].tone]
                                  : "text-fg",
                              )}
                            >
                              {alert.indicators[0].value}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recent activity, cross-workflow change feed */}
          {recentActivity.length > 0 && (
            <section>
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] text-fg">
                  <History className="h-3 w-3" strokeWidth={1.95} />
                  Recent activity
                </h3>
                <span className="text-[12px] tabular-nums text-subtle">
                  {recentActivity.length}
                </span>
              </div>
              <ul className="mt-2.5 space-y-2">
                {recentActivity.map((entry, i) => (
                  <li key={i}>
                    <Link
                      href={`/workflows/${entry.workflowId}`}
                      className="group -mx-2 flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-panel-2/60"
                    >
                      <span
                        className={cn(
                          "mt-[5px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
                          entry.significant
                            ? "bg-critical"
                            : "bg-subtle",
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[12px] leading-[1.4]",
                            entry.significant
                              ? "font-medium text-fg"
                              : "text-fg/85",
                          )}
                        >
                          {entry.summary}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-subtle">
                          <span className="truncate">
                            {entry.workflowShortName}
                          </span>
                          <span className="shrink-0 text-border-strong">·</span>
                          <span className="shrink-0 tabular-nums">
                            {relativeFromNow(entry.at)}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        )}
      </aside>
    </div>
  );
}

function AlertHeroCard({ alert }: { alert: Alert }) {
  const sev = SEVERITY_CARD[alert.severity];
  return (
    <Link
      href={`/workflows/${alert.workflowId}`}
      className={cn(
        "group relative block overflow-hidden rounded-[6px] border transition-colors",
        sev.border,
        sev.bg,
        sev.accent,
      )}
    >
      <SeverityBar severity={alert.severity} />

      <div className="px-6 py-4 pl-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <SeverityIcon severity={alert.severity} />
            <span className="truncate text-[16px] font-medium tracking-tightish text-fg">
              {alert.workflowShortName}
            </span>
          </div>
          <span className="shrink-0 text-[12px] text-subtle">
            {relativeFromNow(alert.detectedAt)}
          </span>
        </div>

        <p className="mt-1.5 max-w-[700px] text-[12px] leading-[1.55] text-fg/85">
          {alert.title}
        </p>

        {alert.indicators.length > 0 && (
          <div
            className={cn(
              "mt-3.5 flex flex-wrap items-baseline gap-x-5 gap-y-1.5 border-t pt-3",
              sev.divider,
            )}
          >
            {alert.indicators.map((ind) => (
              <span
                key={ind.label}
                className="flex items-baseline gap-2 text-[12px]"
              >
                <span className="text-[12px] uppercase tracking-[0.08em] text-subtle">
                  {ind.label}
                </span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    ind.tone ? TONE_TEXT[ind.tone] : "text-fg",
                  )}
                >
                  {ind.value}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
              sev.button,
            )}
          >
            {alert.action}
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function Indicator({
  label,
  count,
  Icon,
  tone,
  toneBg,
}: {
  label: string;
  count: number;
  Icon: LucideIcon;
  tone: string;
  toneBg: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-4 py-2.5 last:border-b-0",
        toneBg,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", tone)} strokeWidth={1.85} />
        <span className="text-[12px] font-medium text-fg">{label}</span>
      </div>
      <span className="text-[12px] font-medium tabular-nums text-fg">
        {count}
      </span>
    </div>
  );
}

function RailChip({
  Icon,
  count,
  toneBg,
  toneText,
  title,
  onClick,
}: {
  Icon: LucideIcon;
  count: number;
  toneBg: string;
  toneText: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "flex w-full flex-col items-center gap-0.5 rounded-md px-1 py-2 transition-opacity hover:opacity-80",
        toneBg,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", toneText)} strokeWidth={1.95} />
      <span className="text-[12px] font-medium tabular-nums text-fg">
        {count}
      </span>
    </button>
  );
}

function EmptyWorkflowsHero() {
  return (
    <div className="mt-3 rounded-[6px] border border-dashed border-border-strong bg-panel p-8">
      <div className="mx-auto flex max-w-[420px] flex-col items-center text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-panel-2 text-muted">
          <WorkflowIcon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 text-[16px] font-medium tracking-tightish text-fg">
          No workflows connected yet
        </h3>
        <p className="mt-1.5 text-[12px] leading-[1.55] text-muted">
          Connect a source platform to bring in your existing automations,
          or load a demo workflow to explore what Blindspot sees.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/connections"
            className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
          >
            Connect a platform
          </Link>
          <button
            type="button"
            onClick={() => setDemoLoaded(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border-strong"
          >
            Add demo workflow
          </button>
        </div>
      </div>
    </div>
  );
}
