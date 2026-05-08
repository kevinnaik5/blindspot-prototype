"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  PLATFORM_LABEL,
  type Platform,
  type Workflow,
  type WorkflowStatus,
} from "@/data/workflows";
import { relativeFromNow } from "@/lib/time";
import { cn } from "@/lib/utils";

type StatusGroup = "all" | "failing" | "healthy" | "paused";

type ChipTone = "neutral" | "ok" | "warning" | "critical";

function statusToGroup(s: WorkflowStatus): "failing" | "healthy" | "paused" {
  if (s === "healthy") return "healthy";
  if (s === "paused") return "paused";
  return "failing";
}

export function WorkflowList({ workflows }: { workflows: Workflow[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusGroup>("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">(
    "all",
  );

  const statusCounts = useMemo(() => {
    const c = { all: workflows.length, failing: 0, healthy: 0, paused: 0 };
    for (const w of workflows) c[statusToGroup(w.status)]++;
    return c;
  }, [workflows]);

  const platformCounts = useMemo(() => {
    const c: Partial<Record<Platform, number>> = {};
    for (const w of workflows) c[w.platform] = (c[w.platform] ?? 0) + 1;
    return c;
  }, [workflows]);

  const platforms = useMemo(
    () => Array.from(new Set(workflows.map((w) => w.platform))),
    [workflows],
  );

  const filtered = useMemo(
    () =>
      workflows.filter((w) => {
        if (statusFilter !== "all" && statusToGroup(w.status) !== statusFilter)
          return false;
        if (platformFilter !== "all" && w.platform !== platformFilter)
          return false;
        return true;
      }),
    [workflows, statusFilter, platformFilter],
  );

  const statusChips: {
    key: StatusGroup;
    label: string;
    count: number;
    tone: ChipTone;
  }[] = [
    { key: "all", label: "All", count: statusCounts.all, tone: "neutral" },
    {
      key: "failing",
      label: "Failing",
      count: statusCounts.failing,
      tone: "critical",
    },
    {
      key: "healthy",
      label: "Healthy",
      count: statusCounts.healthy,
      tone: "ok",
    },
    {
      key: "paused",
      label: "Paused",
      count: statusCounts.paused,
      tone: "warning",
    },
  ];

  // Hide status chips with count 0 (except "All") so the bar stays tight.
  const visibleStatusChips = statusChips.filter(
    (c) => c.key === "all" || c.count > 0,
  );

  const platformChips: {
    key: Platform | "all";
    label: string;
    count: number;
    tone: ChipTone;
  }[] = [
    {
      key: "all",
      label: "All",
      count: workflows.length,
      tone: "neutral",
    },
    ...platforms.map((p) => ({
      key: p,
      label: PLATFORM_LABEL[p],
      count: platformCounts[p] ?? 0,
      tone: "neutral" as ChipTone,
    })),
  ];

  const clearAll = () => {
    setStatusFilter("all");
    setPlatformFilter("all");
  };

  const isFiltered = statusFilter !== "all" || platformFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <FilterChipRow
          label="Status"
          chips={visibleStatusChips}
          activeKey={statusFilter}
          onSelect={(k) => setStatusFilter(k as StatusGroup)}
        />
        <FilterChipRow
          label="Platform"
          chips={platformChips}
          activeKey={platformFilter}
          onSelect={(k) => setPlatformFilter(k as Platform | "all")}
        />
        {isFiltered && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-[11.5px] font-medium text-info hover:text-fg"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[6px] border border-border bg-panel">
        <div className="grid grid-cols-[minmax(0,1fr)_180px_120px_140px_18px] items-center gap-4 border-b border-border px-5 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
          <div>Workflow</div>
          <div>Status</div>
          <div>Last run</div>
          <div>Owner</div>
          <div />
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="text-[12.5px] text-muted">
              No workflows match the current filters.
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="mt-2 text-[12px] font-medium text-info hover:text-fg"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((w) => {
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
        )}
      </div>
    </div>
  );
}

function FilterChipRow({
  label,
  chips,
  activeKey,
  onSelect,
}: {
  label: string;
  chips: { key: string; label: string; count: number; tone: ChipTone }[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
        {label}
      </span>
      {chips.map((c) => (
        <FilterChip
          key={c.key}
          label={c.label}
          count={c.count}
          tone={c.tone}
          active={c.key === activeKey}
          onClick={() => onSelect(c.key)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  count,
  tone,
  active,
  onClick,
}: {
  label: string;
  count: number;
  tone: ChipTone;
  active: boolean;
  onClick: () => void;
}) {
  const activeClass =
    tone === "critical"
      ? "border-critical/45 bg-critical/12 text-fg"
      : tone === "ok"
      ? "border-ok/40 bg-ok/12 text-fg"
      : tone === "warning"
      ? "border-warning/45 bg-warning/12 text-fg"
      : "border-border-strong bg-panel-2 text-fg";

  const countActive =
    tone === "critical"
      ? "text-critical"
      : tone === "ok"
      ? "text-ok"
      : tone === "warning"
      ? "text-warning"
      : "text-subtle";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11.5px] font-medium transition-colors",
        active
          ? activeClass
          : "border-border bg-panel text-muted hover:bg-panel-2 hover:text-fg",
      )}
    >
      <span>{label}</span>
      <span className={cn("tabular-nums", active ? countActive : "text-subtle")}>
        {count}
      </span>
    </button>
  );
}
