"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { Workflow } from "@/data/workflows";
import {
  getRuns,
  type RunStatus,
  type StepBarStatus,
  type Run,
  type StepBar,
} from "@/data/runs";
import { shortDateTime, relativeFromNow } from "@/lib/time";
import { cn } from "@/lib/utils";

const TIMELINE_LIMIT = 8;

const STATUS_META: Record<
  RunStatus,
  { label: string; tone: "ok" | "warning" | "critical"; Icon: LucideIcon }
> = {
  success: { label: "Success", tone: "ok", Icon: CheckCircle2 },
  "silent-failure": {
    label: "Silent failure",
    tone: "warning",
    Icon: AlertTriangle,
  },
  failed: { label: "Failed", tone: "critical", Icon: AlertCircle },
};

const BAR_COLOR: Record<StepBarStatus, string> = {
  ok: "bg-ok/55",
  warning: "bg-warning/65",
  error: "bg-critical/65",
  skipped: "bg-subtle/50",
};

const TONE_TEXT: Record<"ok" | "warning" | "critical", string> = {
  ok: "text-ok",
  warning: "text-warning",
  critical: "text-critical",
};

const TONE_BORDER: Record<"ok" | "warning" | "critical", string> = {
  ok: "border-ok/30 bg-ok/8",
  warning: "border-warning/35 bg-warning/8",
  critical: "border-critical/35 bg-critical/8",
};

export function TimelineView({ workflow }: { workflow: Workflow }) {
  const runs = getRuns(workflow.id).slice(0, TIMELINE_LIMIT);

  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-[320px] text-center">
          <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-subtle">
            Timeline
          </div>
          <div className="mt-2 text-[12px] text-muted">
            No recent runs to display.
          </div>
        </div>
      </div>
    );
  }

  // Shared scale across runs so silent failures visibly read shorter
  // than healthy runs.
  const maxMs = runs.reduce((m, r) => Math.max(m, r.totalMs), 0);
  const niceMax = Math.ceil(maxMs / 100) * 100;

  return (
    <div className="flex h-full flex-col">
      {/* Eyebrow with shared scale */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-bg px-6 py-3">
        <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
          Last {runs.length} runs
        </div>
        <div className="text-[12px] tabular-nums text-subtle">
          shared scale 0 to {niceMax}ms
        </div>
      </div>

      {/* Runs list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {runs.map((run) => (
            <RunBlock
              key={run.id}
              run={run}
              workflow={workflow}
              maxMs={niceMax}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RunBlock({
  run,
  workflow,
  maxMs,
}: {
  run: Run;
  workflow: Workflow;
  maxMs: number;
}) {
  const meta = STATUS_META[run.status];
  const StatusIcon = meta.Icon;

  return (
    <div className="px-6 py-5">
      {/* Run header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-[12px] font-medium tabular-nums text-fg">
            Run #{run.number}
          </span>
          <span className="text-border-strong">·</span>
          <span className="text-[12px] tabular-nums text-muted">
            {shortDateTime(run.startedAt)}
          </span>
          <span className="text-[12px] text-subtle">
            {relativeFromNow(run.startedAt)}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium",
              TONE_BORDER[meta.tone],
              TONE_TEXT[meta.tone],
            )}
          >
            <StatusIcon className="h-3 w-3" strokeWidth={1.95} />
            {meta.label}
          </span>
        </div>
        <div className="shrink-0 text-[12px] tabular-nums text-muted">
          Total{" "}
          <span className="font-medium text-fg">
            {(run.totalMs / 1000).toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Step rows */}
      <div className="mt-3.5 space-y-1.5">
        {workflow.steps.map((step) => {
          const bar = run.steps.find((s) => s.stepId === step.id);
          if (!bar) return null;
          return (
            <StepRow
              key={step.id}
              label={step.label}
              bar={bar}
              maxMs={maxMs}
            />
          );
        })}
      </div>
    </div>
  );
}

function StepRow({
  label,
  bar,
  maxMs,
}: {
  label: string;
  bar: StepBar;
  maxMs: number;
}) {
  const left = (bar.startMs / maxMs) * 100;
  const width = (bar.durationMs / maxMs) * 100;

  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)_64px] items-center gap-3">
      <div className="truncate text-[12px] text-muted">{label}</div>
      <div className="relative h-[18px] rounded-sm bg-panel-2/50">
        <div
          className={cn(
            "absolute top-0 h-full min-w-[2px] rounded-sm",
            BAR_COLOR[bar.status],
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      <div className="text-right text-[12px] tabular-nums text-subtle">
        {bar.durationMs}ms
      </div>
    </div>
  );
}
