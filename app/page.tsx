import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Workflow,
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
  Plug,
  Upload,
  Play,
  Users,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { ALERTS, type IndicatorTone } from "@/data/alerts";
import { WORKFLOWS } from "@/data/workflows";
import { NOW, relativeFromNow } from "@/lib/time";
import { Eyebrow, SectionHeading } from "@/components/section-label";
import { SeverityBar, SeverityIcon } from "@/components/severity-bar";
import { cn } from "@/lib/utils";

const ONBOARDING: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Connect a platform",
    description: "Sync workflows from Zapier, n8n, Make, and more.",
    href: "/connections",
    icon: Plug,
  },
  {
    title: "Import a workflow",
    description: "Add a workflow manually with YAML or JSON.",
    href: "/connections",
    icon: Upload,
  },
  {
    title: "Walk through a demo",
    description: "See how Blindspot reads an automation.",
    href: "/workflows/customer-onboarding",
    icon: Play,
  },
  {
    title: "Invite your team",
    description: "Add ops staff to this workspace.",
    href: "/settings",
    icon: Users,
  },
  {
    title: "Set up alert routing",
    description: "Send critical alerts to Slack or PagerDuty.",
    href: "/settings",
    icon: Bell,
  },
];

const TONE_TEXT: Record<IndicatorTone, string> = {
  critical: "text-critical",
  warning: "text-warning",
  info: "text-info",
  muted: "text-muted",
};

export default function HomePage() {
  const today = NOW.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const counts = {
    healthy: WORKFLOWS.filter((w) => w.status === "healthy").length,
    critical: ALERTS.filter((a) => a.severity === "critical").length,
    notice: ALERTS.filter((a) => a.severity === "notice").length,
  };
  const needsAttention = WORKFLOWS.length - counts.healthy;

  return (
    <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* Main column */}
      <div className="min-w-0 px-8 pt-8 pb-16">
        {/* Eyebrow */}
        <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
          Home
        </div>

        {/* Welcome / quick start */}
        <section className="mt-8">
          <Eyebrow>Let&apos;s get started</Eyebrow>
          <h1 className="mt-3 text-[32px] font-medium leading-[1.1] tracking-tightish text-fg">
            Welcome to Blindspot
          </h1>

          {/* Side-scrolling onboarding cards */}
          <div className="-mx-8 mt-7 flex gap-3 overflow-x-auto px-8 pb-3 [scrollbar-width:thin]">
            {ONBOARDING.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex h-[164px] w-[260px] shrink-0 flex-col rounded-[6px] border border-border bg-panel p-4 transition-colors hover:border-border-strong hover:bg-panel-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-panel-2 text-muted transition-colors group-hover:border-border-strong group-hover:text-fg">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </div>

                  <div className="mt-3.5">
                    <div className="text-[14px] font-medium tracking-tightish text-fg">
                      {card.title}
                    </div>
                    <div className="mt-1 text-[12.5px] leading-[1.5] text-muted">
                      {card.description}
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                    <ArrowUpRight
                      className="h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      strokeWidth={1.75}
                    />
                  </div>
                </Link>
              );
            })}
            <div className="w-2 shrink-0" />
          </div>
        </section>

        {/* All workflows */}
        <section className="mt-14">
          <SectionHeading
            icon={Workflow}
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

          <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
            <div className="grid grid-cols-[minmax(0,1fr)_180px_120px_140px_18px] items-center gap-4 border-b border-border px-5 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
              <div>Workflow</div>
              <div>Status</div>
              <div>Last run</div>
              <div>Owner</div>
              <div />
            </div>

            <ul className="divide-y divide-border">
              {WORKFLOWS.map((w) => {
                const failing = w.status !== "healthy";
                return (
                  <li key={w.id}>
                    <Link
                      href={`/workflows/${w.id}`}
                      className="group grid grid-cols-[minmax(0,1fr)_180px_120px_140px_18px] items-center gap-4 px-5 py-3 text-[13px] transition-colors hover:bg-panel-2"
                    >
                      <div className="min-w-0 truncate text-fg">{w.name}</div>
                      <div
                        className={cn(
                          "truncate",
                          failing ? "text-critical" : "text-muted",
                        )}
                      >
                        {w.statusLine}
                      </div>
                      <div className="tabular-nums text-muted">
                        {relativeFromNow(w.lastRunAt)}
                      </div>
                      <div className="truncate text-muted">{w.owner.name}</div>
                      <div className="text-subtle opacity-0 transition-opacity group-hover:opacity-100">
                        <ChevronRight
                          className="h-3.5 w-3.5"
                          strokeWidth={1.75}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>

      {/* Side panel */}
      <aside className="border-t border-border bg-panel xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:border-l xl:border-t-0">
        <div className="space-y-6 px-6 py-8">
          {/* Status card */}
          <div className="overflow-hidden rounded-[6px] border border-border bg-panel-2">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="flex items-center gap-2 text-[13.5px] font-medium tracking-tightish text-fg">
                <Activity
                  className="h-3.5 w-3.5 text-muted"
                  strokeWidth={1.75}
                />
                <span>Status</span>
              </h3>
              <span className="text-[11px] text-subtle">{today}</span>
            </div>
            <div className="px-4 pt-4 pb-3">
              <p className="text-[13.5px] leading-[1.55] text-fg">
                {WORKFLOWS.length} workflows are connected.{" "}
                <span className="text-critical">
                  {needsAttention}{" "}
                  {needsAttention === 1 ? "needs" : "need"} attention
                </span>
                ; the other {counts.healthy} are running normally.
              </p>
            </div>
            <div className="border-t border-border">
              <Indicator
                label="Healthy"
                count={counts.healthy}
                Icon={CheckCircle2}
                tone="text-ok"
              />
              <Indicator
                label="Critical"
                count={counts.critical}
                Icon={AlertCircle}
                tone="text-critical"
              />
              <Indicator
                label="Notice"
                count={counts.notice}
                Icon={Info}
                tone="text-info"
              />
            </div>
          </div>

          {/* Attention cards */}
          <section>
            <SectionHeading icon={AlertTriangle}>Needs attention</SectionHeading>

            <div className="mt-3 space-y-3">
              {ALERTS.map((alert) => (
                <Link
                  key={alert.id}
                  href={`/workflows/${alert.workflowId}`}
                  className="group relative block overflow-hidden rounded-[6px] border border-border bg-panel-2 transition-colors hover:border-border-strong"
                >
                  <SeverityBar severity={alert.severity} />

                  {/* Header */}
                  <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2 pl-5">
                    <div className="flex min-w-0 items-center gap-2">
                      <SeverityIcon severity={alert.severity} />
                      <span className="truncate text-[13px] font-medium text-fg">
                        {alert.workflowShortName}
                      </span>
                    </div>
                    <span className="shrink-0 text-[11px] text-subtle">
                      {relativeFromNow(alert.detectedAt)}
                    </span>
                  </div>

                  {/* Insight (one line) */}
                  <p className="px-4 pb-3 pl-5 text-[12.5px] leading-[1.5] text-muted">
                    {alert.title}
                  </p>

                  {/* Indicator rows */}
                  <dl className="border-t border-border">
                    {alert.indicators.map((ind) => (
                      <div
                        key={ind.label}
                        className="flex items-center justify-between border-b border-border/60 px-4 py-2 pl-5 last:border-b-0"
                      >
                        <dt className="text-[11.5px] text-muted">
                          {ind.label}
                        </dt>
                        <dd
                          className={cn(
                            "text-[12px] font-medium tabular-nums",
                            ind.tone ? TONE_TEXT[ind.tone] : "text-fg",
                          )}
                        >
                          {ind.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* Action footer styled as a real button */}
                  <div className="flex justify-end border-t border-border px-3 py-3 pl-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-panel px-3 py-1.5 text-[12px] font-medium text-fg transition-colors group-hover:bg-bg group-hover:border-muted/40">
                      {alert.action}
                      <ArrowRight
                        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                        strokeWidth={2}
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function Indicator({
  label,
  count,
  Icon,
  tone,
}: {
  label: string;
  count: number;
  Icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-b-0">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3.5 w-3.5", tone)} strokeWidth={1.85} />
        <span className="text-[12.5px] text-muted">{label}</span>
      </div>
      <span className="text-[13px] font-medium tabular-nums text-fg">
        {count}
      </span>
    </div>
  );
}
