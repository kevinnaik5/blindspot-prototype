"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  Plug,
  Plus,
  Search,
  Upload,
  Workflow as WorkflowIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  PLATFORM_LABEL,
  type Platform,
  type WorkflowStatus,
} from "@/data/workflows";
import { relativeFromNow } from "@/lib/time";
import { setDemoLoaded } from "@/lib/demo";
import { SectionHeading } from "@/components/section-label";
import { cn } from "@/lib/utils";

// Slim shape the directory works with. The page assembles this from
// WORKFLOWS + getHealth + getRuns server-side so the client component
// only deals with display-ready data.
export type DirectoryWorkflow = {
  id: string;
  name: string;
  platform: Platform;
  status: WorkflowStatus;
  statusLine: string;
  lastRunAt: string;
  owner: { name: string; email?: string };
  healthScore?: number;
  recentFailures: number;
};

type StatusGroup = "all" | "failing" | "healthy" | "paused";
type SortKey =
  | "recently-changed"
  | "most-failures"
  | "health-score"
  | "alphabetical";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recently-changed", label: "Recently changed" },
  { key: "most-failures", label: "Most failures" },
  { key: "health-score", label: "Health score" },
  { key: "alphabetical", label: "Alphabetical" },
];

function statusToGroup(s: WorkflowStatus): "failing" | "healthy" | "paused" {
  if (s === "healthy") return "healthy";
  if (s === "paused") return "paused";
  return "failing";
}

function healthTone(score?: number): {
  text: string;
  bg: string;
  label: string;
} {
  if (score === undefined) {
    return { text: "text-muted", bg: "bg-panel-2", label: "—" };
  }
  if (score >= 80)
    return { text: "text-ok", bg: "bg-ok/15", label: "Healthy" };
  if (score >= 60)
    return {
      text: "text-warning",
      bg: "bg-warning/15",
      label: "Degraded",
    };
  return { text: "text-critical", bg: "bg-critical/15", label: "Critical" };
}

export function WorkflowDirectory({
  workflows,
}: {
  workflows: DirectoryWorkflow[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusGroup>("all");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">(
    "all",
  );
  const [sort, setSort] = useState<SortKey>("recently-changed");
  const [addOpen, setAddOpen] = useState(false);

  const counts = useMemo(() => {
    const c = {
      all: workflows.length,
      failing: 0,
      healthy: 0,
      paused: 0,
    };
    for (const w of workflows) c[statusToGroup(w.status)]++;
    return c;
  }, [workflows]);

  const platforms = useMemo(
    () => Array.from(new Set(workflows.map((w) => w.platform))),
    [workflows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = workflows.filter((w) => {
      if (statusFilter !== "all" && statusToGroup(w.status) !== statusFilter)
        return false;
      if (platformFilter !== "all" && w.platform !== platformFilter)
        return false;
      if (q && !w.name.toLowerCase().includes(q)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "recently-changed":
          return (
            new Date(b.lastRunAt).getTime() - new Date(a.lastRunAt).getTime()
          );
        case "most-failures":
          return b.recentFailures - a.recentFailures;
        case "health-score":
          return (a.healthScore ?? 101) - (b.healthScore ?? 101);
        case "alphabetical":
          return a.name.localeCompare(b.name);
      }
    });

    return list;
  }, [workflows, query, statusFilter, platformFilter, sort]);

  const isFiltered =
    statusFilter !== "all" ||
    platformFilter !== "all" ||
    query.trim() !== "";
  const clearAll = () => {
    setQuery("");
    setStatusFilter("all");
    setPlatformFilter("all");
  };

  return (
    <div className="min-h-screen px-8 pt-8 pb-16">
      {/* Eyebrow */}
      <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        Workflows
      </div>

      {/* Header row */}
      <div className="mt-3 flex items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-[28px] font-medium leading-[1.2] tracking-tightish text-fg">
            All workflows
          </h1>
          <p className="mt-2 max-w-[640px] text-[12px] leading-[1.55] text-muted">
            {counts.all === 0 ? (
              "No workflows connected yet."
            ) : (
              <>
                {counts.all}{" "}
                {counts.all === 1 ? "workflow" : "workflows"} connected.{" "}
                {counts.failing > 0 ? (
                  <>
                    <span className="text-critical">
                      {counts.failing}{" "}
                      {counts.failing === 1 ? "needs" : "need"} attention
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

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
          Add workflow
        </button>
      </div>

      <AddWorkflowModal open={addOpen} onClose={() => setAddOpen(false)} />

      {workflows.length === 0 ? (
        <EmptyDirectoryHero onAddDemo={() => setDemoLoaded(true)} />
      ) : (
        <>
      {/* Toolbar: search + filters + sort */}
      <div className="mt-7 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 max-w-[320px]">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle"
              strokeWidth={1.85}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workflows…"
              className="w-full rounded-md bg-panel-2 pl-8 pr-3 py-1.5 text-[12px] text-fg placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-info"
            />
          </div>

          {/* Sort */}
          <SortDropdown value={sort} onChange={setSort} />

          {isFiltered && (
            <button
              type="button"
              onClick={clearAll}
              className="ml-auto text-[12px] font-medium text-info hover:text-fg"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <FilterChipRow
            label="Status"
            chips={[
              { key: "all", label: "All", count: counts.all, tone: "neutral" },
              ...(counts.failing > 0
                ? [
                    {
                      key: "failing",
                      label: "Failing",
                      count: counts.failing,
                      tone: "critical" as const,
                    },
                  ]
                : []),
              ...(counts.healthy > 0
                ? [
                    {
                      key: "healthy",
                      label: "Healthy",
                      count: counts.healthy,
                      tone: "ok" as const,
                    },
                  ]
                : []),
              ...(counts.paused > 0
                ? [
                    {
                      key: "paused",
                      label: "Paused",
                      count: counts.paused,
                      tone: "warning" as const,
                    },
                  ]
                : []),
            ]}
            activeKey={statusFilter}
            onSelect={(k) => setStatusFilter(k as StatusGroup)}
          />
          <FilterChipRow
            label="Platform"
            chips={[
              {
                key: "all",
                label: "All",
                count: workflows.length,
                tone: "neutral",
              },
              ...platforms.map((p) => ({
                key: p,
                label: PLATFORM_LABEL[p],
                count: workflows.filter((w) => w.platform === p).length,
                tone: "neutral" as const,
              })),
            ]}
            activeKey={platformFilter}
            onSelect={(k) => setPlatformFilter(k as Platform | "all")}
          />
        </div>
      </div>

      {/* Table */}
      <section className="mt-7">
        <SectionHeading icon={WorkflowIcon}>Results</SectionHeading>

        <div className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
          <div className="grid grid-cols-[minmax(0,1.4fr)_140px_120px_120px_100px_140px_18px] items-center gap-4 border-b border-border bg-panel-2 px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
            <div>Workflow</div>
            <div>Health</div>
            <div>Platform</div>
            <div>Last run</div>
            <div>24h failures</div>
            <div>Owner</div>
            <div />
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="text-[12px] text-muted">
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
                const ht = healthTone(w.healthScore);
                return (
                  <li key={w.id}>
                    <Link
                      href={`/workflows/${w.id}?from=workflows`}
                      className="group grid grid-cols-[minmax(0,1.4fr)_140px_120px_120px_100px_140px_18px] items-center gap-4 px-5 py-3 text-[12px] transition-colors hover:bg-panel-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-fg">{w.name}</div>
                        <div className="mt-0.5 truncate text-[12px] text-subtle">
                          {w.statusLine}
                        </div>
                      </div>
                      <div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-medium",
                            ht.bg,
                            ht.text,
                          )}
                        >
                          <span className="tabular-nums">
                            {w.healthScore ?? "—"}
                          </span>
                          <span className="text-[12px]">{ht.label}</span>
                        </span>
                      </div>
                      <div className="truncate text-muted">
                        {PLATFORM_LABEL[w.platform]}
                      </div>
                      <div className="tabular-nums text-muted">
                        {relativeFromNow(w.lastRunAt)}
                      </div>
                      <div
                        className={cn(
                          "tabular-nums",
                          w.recentFailures > 0
                            ? "text-critical"
                            : "text-subtle",
                        )}
                      >
                        {w.recentFailures > 0 ? w.recentFailures : "—"}
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
      </section>
        </>
      )}
    </div>
  );
}

function EmptyDirectoryHero({ onAddDemo }: { onAddDemo: () => void }) {
  return (
    <div className="mt-7 rounded-[6px] border border-dashed border-border-strong bg-panel p-12">
      <div className="mx-auto flex max-w-[440px] flex-col items-center text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-panel-2 text-muted">
          <WorkflowIcon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 text-[20px] font-medium tracking-tightish text-fg">
          No workflows yet
        </h3>
        <p className="mt-2 text-[12px] leading-[1.6] text-muted">
          Connect a source platform to import your workflows automatically,
          or load a demo workflow to explore what Blindspot looks like in
          use.
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
            onClick={onAddDemo}
            className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border-strong"
          >
            Add demo workflow
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sort dropdown ---

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (k: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-border-strong"
      >
        <span className="text-subtle">Sort:</span>
        <span>{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 text-subtle transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={1.85}
        />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close sort menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-1.5 w-[180px] overflow-hidden rounded-md border border-border bg-panel shadow-lg">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full px-3 py-2 text-left text-[12px] transition-colors",
                  opt.key === value
                    ? "bg-panel-2 text-fg"
                    : "text-muted hover:bg-panel-2/60 hover:text-fg",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// --- Filter chips (mirrors WorkflowList's chip palette) ---

type ChipTone = "neutral" | "ok" | "warning" | "critical";

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
      <span className="mr-1 text-[12px] font-medium uppercase tracking-[0.08em] text-subtle">
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
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium transition-colors",
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

// --- Add workflow modal ---

function AddWorkflowModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add a workflow"
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-[8px] border border-border bg-panel shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-[16px] font-medium tracking-tightish text-fg">
            Add a workflow
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-panel-2 hover:text-fg"
          >
            <X className="h-4 w-4" strokeWidth={1.85} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
          <AddWorkflowCard
            Icon={Plug}
            label="Connect a platform"
            detail="Zapier, n8n, Make, Workato, Pipedream"
            href="/connections"
            onClick={onClose}
          />
          <AddWorkflowCard
            Icon={Upload}
            label="Import file"
            detail="YAML or JSON definition"
            href="/connections"
            onClick={onClose}
          />
          <AddWorkflowCard
            Icon={ClipboardPaste}
            label="Paste YAML"
            detail="Drop in raw text from any platform"
            href="/connections"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}

function AddWorkflowCard({
  Icon,
  label,
  detail,
  href,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  detail: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex flex-col gap-3 rounded-[6px] border border-border bg-panel-2 p-4 transition-colors hover:border-border-strong hover:bg-border-strong/60"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-panel text-muted transition-colors group-hover:text-fg">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div>
        <div className="text-[12px] font-medium text-fg">{label}</div>
        <div className="mt-1 text-[12px] leading-[1.45] text-subtle">
          {detail}
        </div>
      </div>
    </Link>
  );
}
