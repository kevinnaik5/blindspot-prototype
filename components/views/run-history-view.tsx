"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import type { Workflow } from "@/data/workflows";
import {
  getRuns,
  type Run,
  type RunStatus,
  type StepBar,
  type StepBarStatus,
} from "@/data/runs";
import { shortDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

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

const PATTERN_COLOR: Record<RunStatus, string> = {
  success: "bg-ok/55",
  "silent-failure": "bg-warning/65",
  failed: "bg-critical/65",
};

const BAR_COLOR: Record<StepBarStatus, string> = {
  ok: "bg-ok/55",
  warning: "bg-warning/65",
  error: "bg-critical/65",
  skipped: "bg-subtle/50",
};

type StatusFilter = RunStatus | "all";
type TimeFilter = "all" | "last-hour" | "today" | "last-24h";

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "last-hour", label: "Last hour" },
  { key: "today", label: "Today" },
  { key: "last-24h", label: "Last 24h" },
];

export function RunHistoryView({
  workflow,
  initialStatus,
}: {
  workflow: Workflow;
  // Optional starting filter, e.g. when navigating in from a run-composition
  // crosslink in Health that scopes the list to a particular status.
  initialStatus?: RunStatus;
}) {
  const runs = getRuns(workflow.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatus ?? "all",
  );
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const counts = useMemo(
    () =>
      runs.reduce(
        (acc, r) => {
          acc[r.status] = (acc[r.status] ?? 0) + 1;
          return acc;
        },
        { success: 0, "silent-failure": 0, failed: 0 } as Record<
          RunStatus,
          number
        >,
      ),
    [runs],
  );

  // Anchor "now" to the latest run timestamp so time filters stay
  // meaningful regardless of when the demo is viewed.
  const latestMs = useMemo(
    () => (runs[0] ? new Date(runs[0].startedAt).getTime() : Date.now()),
    [runs],
  );

  const filtered = useMemo(() => {
    let result = runs;
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (timeFilter !== "all") {
      let cutoffMs: number;
      if (timeFilter === "last-hour") {
        cutoffMs = latestMs - 60 * 60 * 1000;
      } else if (timeFilter === "last-24h") {
        cutoffMs = latestMs - 24 * 60 * 60 * 1000;
      } else {
        // "today" — start of the calendar day of the latest run
        const day = new Date(latestMs);
        day.setHours(0, 0, 0, 0);
        cutoffMs = day.getTime();
      }
      result = result.filter(
        (r) => new Date(r.startedAt).getTime() >= cutoffMs,
      );
    }
    return result;
  }, [runs, statusFilter, timeFilter, latestMs]);

  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-[320px] text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-subtle">
            Run history
          </div>
          <div className="mt-2 text-[13px] text-muted">
            No recent runs to display.
          </div>
        </div>
      </div>
    );
  }

  // Pattern bar reads left-to-right as oldest-to-newest, the natural
  // direction for time. The list below reads newest-on-top.
  const oldestToNewest = [...runs].reverse();

  const summary: string[] = [];
  if (counts["success"]) summary.push(`${counts["success"]} successful`);
  if (counts["silent-failure"])
    summary.push(`${counts["silent-failure"]} silent failures`);
  if (counts["failed"]) summary.push(`${counts["failed"]} failed`);

  const oldest = oldestToNewest[0];
  const newest = oldestToNewest[oldestToNewest.length - 1];

  return (
    <div className="flex h-full flex-col">
      {/* Eyebrow with pattern bar */}
      <div className="shrink-0 border-b border-border bg-bg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
            Last {runs.length} runs
          </div>
          <div className="text-[11px] text-subtle">{summary.join(" · ")}</div>
        </div>

        {/* Pattern bar */}
        <div className="mt-3 flex items-center gap-3">
          <span className="shrink-0 text-[10.5px] tabular-nums text-subtle">
            {shortDateTime(oldest.startedAt)}
          </span>
          <div className="flex h-3 flex-1 gap-px overflow-hidden rounded-sm">
            {oldestToNewest.map((run) => (
              <div
                key={run.id}
                title={`Run #${run.number} · ${STATUS_META[run.status].label}`}
                className={cn("flex-1", PATTERN_COLOR[run.status])}
              />
            ))}
          </div>
          <span className="shrink-0 text-[10.5px] tabular-nums text-subtle">
            {shortDateTime(newest.startedAt)}
          </span>
        </div>

        {/* Filter row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusChip
              label="All"
              count={runs.length}
              active={statusFilter === "all"}
              tone="neutral"
              onClick={() => setStatusFilter("all")}
            />
            <StatusChip
              label="Silent failures"
              count={counts["silent-failure"]}
              active={statusFilter === "silent-failure"}
              tone="warning"
              onClick={() => setStatusFilter("silent-failure")}
            />
            <StatusChip
              label="Failed"
              count={counts["failed"]}
              active={statusFilter === "failed"}
              tone="critical"
              onClick={() => setStatusFilter("failed")}
            />
            <StatusChip
              label="Successful"
              count={counts["success"]}
              active={statusFilter === "success"}
              tone="ok"
              onClick={() => setStatusFilter("success")}
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            {TIME_FILTERS.map((tf) => (
              <button
                key={tf.key}
                type="button"
                onClick={() => setTimeFilter(tf.key)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] transition-colors",
                  timeFilter === tf.key
                    ? "bg-panel-2 text-fg"
                    : "text-subtle hover:text-fg",
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Column header (sticky) */}
        <div className="sticky top-0 z-10 grid grid-cols-[150px_140px_72px_minmax(0,1fr)_18px] items-center gap-3 border-b border-border bg-bg px-6 py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
          <div>Time</div>
          <div>Status</div>
          <div className="text-right">Duration</div>
          <div>Summary</div>
          <div />
        </div>

        {filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-12">
            <div className="max-w-[360px] text-center">
              <div className="text-[12.5px] text-muted">
                No runs match the current filters.
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setTimeFilter("all");
                }}
                className="mt-2 text-[12px] font-medium text-info hover:text-fg"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((run) => (
              <RunHistoryRow
                key={run.id}
                run={run}
                workflow={workflow}
                expanded={expandedId === run.id}
                onToggle={() =>
                  setExpandedId(expandedId === run.id ? null : run.id)
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusChip({
  label,
  count,
  active,
  tone,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  tone: "neutral" | "ok" | "warning" | "critical";
  onClick: () => void;
}) {
  const activeClass =
    tone === "warning"
      ? "border-warning/45 bg-warning/12 text-fg"
      : tone === "critical"
      ? "border-critical/45 bg-critical/12 text-fg"
      : tone === "ok"
      ? "border-ok/40 bg-ok/12 text-fg"
      : "border-border-strong bg-panel-2 text-fg";

  const countActive =
    tone === "warning"
      ? "text-warning"
      : tone === "critical"
      ? "text-critical"
      : tone === "ok"
      ? "text-ok"
      : "text-subtle";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors",
        active
          ? activeClass
          : "border-border bg-panel text-muted hover:bg-panel-2 hover:text-fg",
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          active ? countActive : "text-subtle",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function RunHistoryRow({
  run,
  workflow,
  expanded,
  onToggle,
}: {
  run: Run;
  workflow: Workflow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const meta = STATUS_META[run.status];
  const StatusIcon = meta.Icon;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "grid w-full grid-cols-[150px_140px_72px_minmax(0,1fr)_18px] items-center gap-3 px-6 py-2.5 text-left text-[12.5px] transition-colors",
          expanded ? "bg-panel" : "hover:bg-panel/60",
        )}
      >
        <div className="tabular-nums text-muted">
          {shortDateTime(run.startedAt)}
        </div>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10.5px] font-medium",
            TONE_BORDER[meta.tone],
            TONE_TEXT[meta.tone],
          )}
        >
          <StatusIcon className="h-3 w-3" strokeWidth={1.95} />
          {meta.label}
        </span>
        <div className="text-right tabular-nums text-fg">
          {(run.totalMs / 1000).toFixed(2)}s
        </div>
        <div className="min-w-0 truncate text-muted">{run.summary}</div>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-subtle transition-transform",
            expanded && "rotate-90",
          )}
          strokeWidth={1.85}
        />
      </button>

      {expanded && (
        <div className="border-t border-border bg-bg px-6 py-4">
          <CompactWaterfall run={run} workflow={workflow} />
        </div>
      )}
    </li>
  );
}

function CompactWaterfall({
  run,
  workflow,
}: {
  run: Run;
  workflow: Workflow;
}) {
  const maxMs = run.totalMs;
  return (
    <div className="space-y-1.5">
      {workflow.steps.map((step) => {
        const bar = run.steps.find((s) => s.stepId === step.id);
        if (!bar) return null;
        return (
          <CompactRow
            key={step.id}
            label={step.label}
            bar={bar}
            maxMs={maxMs}
          />
        );
      })}
    </div>
  );
}

function CompactRow({
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
    <div className="grid grid-cols-[120px_minmax(0,1fr)_56px] items-center gap-3">
      <div className="truncate text-[11px] text-muted">{label}</div>
      <div className="relative h-[14px] rounded-sm bg-panel-2/50">
        <div
          className={cn(
            "absolute top-0 h-full min-w-[2px] rounded-sm",
            BAR_COLOR[bar.status],
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      <div className="text-right text-[10.5px] tabular-nums text-subtle">
        {bar.durationMs}ms
      </div>
    </div>
  );
}
