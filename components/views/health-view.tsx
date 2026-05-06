"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Info,
  BarChart3,
  Telescope,
  Clock,
  type LucideIcon,
} from "lucide-react";
import type { Workflow } from "@/data/workflows";
import {
  getHealth,
  type AnomalySeverity,
  type WorkflowHealth,
  type HealthStat,
  type LearnedBaseline,
} from "@/data/health";
import { getRuns, type RunStatus } from "@/data/runs";
import { SectionHeading } from "@/components/section-label";
import { relativeFromNow, shortDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

const SEVERITY_META: Record<
  AnomalySeverity,
  { Icon: LucideIcon; tone: "critical" | "warning" | "info"; label: string }
> = {
  critical: { Icon: AlertCircle, tone: "critical", label: "Critical" },
  warning: { Icon: AlertTriangle, tone: "warning", label: "Warning" },
  notice: { Icon: Info, tone: "info", label: "Notice" },
};

const TONE_TEXT = {
  critical: "text-critical",
  warning: "text-warning",
  info: "text-info",
};

const TONE_BG = {
  critical: "bg-critical/12 border-critical/30",
  warning: "bg-warning/12 border-warning/30",
  info: "bg-info/12 border-info/30",
};

function scoreTone(score: number): {
  text: string;
  ring: string;
  label: string;
  bar: string;
} {
  if (score >= 80) {
    return { text: "text-ok", ring: "border-ok/40", label: "Healthy", bar: "bg-ok" };
  }
  if (score >= 60) {
    return {
      text: "text-warning",
      ring: "border-warning/40",
      label: "Degraded",
      bar: "bg-warning",
    };
  }
  return {
    text: "text-critical",
    ring: "border-critical/40",
    label: "Critical",
    bar: "bg-critical",
  };
}

export function HealthView({ workflow }: { workflow: Workflow }) {
  const health = getHealth(workflow.id);

  if (!health) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-[320px] text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-subtle">
            Health
          </div>
          <div className="mt-2 text-[13px] text-muted">
            No health data available for this workflow yet.
          </div>
        </div>
      </div>
    );
  }

  const tone = scoreTone(health.score);
  const delta = health.deltaSinceYesterday;

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-9 px-8 py-8">
        {/* Health score card. No more 4-column stats footer. */}
        <section className="overflow-hidden rounded-[8px] border border-border bg-panel">
          <div className="px-6 pt-5 pb-6">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-subtle">
              Health score
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span
                className={cn(
                  "text-[44px] font-medium leading-none tabular-nums tracking-tightish",
                  tone.text,
                )}
              >
                {health.score}
              </span>
              <span className="text-[15px] text-subtle">/ 100</span>
              <span
                className={cn(
                  "ml-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
                  tone.ring,
                  tone.text,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", tone.bar)} />
                {tone.label}
              </span>
            </div>

            <HealthBar
              score={health.score}
              priorScore={health.score - delta}
              barClass={tone.bar}
              scoreText={tone.text}
            />

            <p className="mt-4 max-w-[760px] text-[14px] leading-[1.6] text-fg">
              {health.annotation}
            </p>
          </div>
        </section>

        {/* Designed stat cards — replace the divided footer. */}
        {health.keyStats.length > 0 && (
          <StatCardsRow stats={health.keyStats} />
        )}

        {/* What we've learned. Now a 2-column story-card grid. */}
        <LearnedSection health={health} />

        {/* Run composition (Cloudflare-style) */}
        <RunComposition workflowId={workflow.id} />

        {/* Timeline chart */}
        <section>
          <SectionHeading icon={Activity}>7 day timeline</SectionHeading>
          <div className="mt-3 rounded-[6px] border border-border bg-panel p-5">
            <HealthChart health={health} />
          </div>
        </section>

        {/* Anomalies */}
        <section>
          <SectionHeading icon={AlertTriangle}>Detected anomalies</SectionHeading>
          {health.anomalies.length === 0 ? (
            <p className="mt-3 text-[13px] text-subtle">
              No anomalies in the last 7 days.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {health.anomalies.map((a) => {
                const sm = SEVERITY_META[a.severity];
                const Icon = sm.Icon;
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "rounded-[6px] border bg-panel p-4",
                      TONE_BG[sm.tone],
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          TONE_TEXT[sm.tone],
                        )}
                        strokeWidth={1.85}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-[13.5px] leading-[1.5] text-fg">
                            {a.summary}
                          </p>
                          <span className="shrink-0 text-[11px] tabular-nums text-subtle">
                            {shortDateTime(a.at)}
                          </span>
                        </div>
                        {a.detail && (
                          <p className="mt-1.5 text-[12.5px] leading-[1.55] text-muted">
                            {a.detail}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-subtle">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-sm border px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.08em]",
                              TONE_BG[sm.tone],
                              TONE_TEXT[sm.tone],
                            )}
                          >
                            {sm.label}
                          </span>
                          <span>{relativeFromNow(a.at)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// --- Stat cards row ---

function StatCardsRow({ stats }: { stats: HealthStat[] }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} stat={stat} />
      ))}
    </section>
  );
}

function StatCard({ stat }: { stat: HealthStat }) {
  const valueTone = stat.tone
    ? stat.tone === "critical"
      ? "text-critical"
      : stat.tone === "warning"
      ? "text-warning"
      : stat.tone === "ok"
      ? "text-ok"
      : "text-muted"
    : "text-fg";

  return (
    <div className="rounded-[6px] border border-border bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10.5px] font-medium uppercase tracking-[0.1em] text-subtle">
          {stat.label}
        </div>
        {stat.visual?.kind === "clock" && (
          <Clock
            className={cn(
              "h-4 w-4 shrink-0",
              stat.tone === "critical" ? "text-critical/70" : "text-subtle",
            )}
            strokeWidth={1.75}
          />
        )}
      </div>

      <div
        className={cn(
          "mt-2.5 text-[26px] font-medium leading-none tabular-nums tracking-tightish",
          valueTone,
        )}
      >
        {stat.value}
      </div>

      {stat.caption && (
        <div className="mt-1 text-[11.5px] text-subtle">{stat.caption}</div>
      )}

      {stat.visual && stat.visual.kind !== "clock" && (
        <div className="mt-3">
          {stat.visual.kind === "ratio" && <RatioBar pct={stat.visual.pct} />}
          {stat.visual.kind === "compare" && (
            <CompareBars
              current={stat.visual.current}
              baseline={stat.visual.baseline}
              max={stat.visual.max}
            />
          )}
          {stat.visual.kind === "people" && (
            <PeopleStack total={stat.visual.total} />
          )}
        </div>
      )}
    </div>
  );
}

function RatioBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-panel-2">
      <div
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        className="h-full bg-critical/70"
      />
    </div>
  );
}

function CompareBars({
  current,
  baseline,
  max,
}: {
  current: number;
  baseline: number;
  max: number;
}) {
  const curPct = Math.min(100, (current / max) * 100);
  const basePct = Math.min(100, (baseline / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="w-12 shrink-0 text-[9.5px] uppercase tracking-[0.06em] text-subtle">
          today
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-panel-2">
          <div
            style={{ width: `${curPct}%` }}
            className="h-full bg-fg/55"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-12 shrink-0 text-[9.5px] uppercase tracking-[0.06em] text-subtle">
          typical
        </span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-panel-2">
          <div
            style={{ width: `${basePct}%` }}
            className="h-full bg-fg/25"
          />
        </div>
      </div>
    </div>
  );
}

function PeopleStack({ total }: { total: number }) {
  // Render up to 10 dots, then a "+N" suffix to suggest scale.
  const shown = Math.min(10, total);
  const rest = Math.max(0, total - shown);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-critical/55"
        />
      ))}
      {rest > 0 && (
        <span className="ml-1 text-[10px] tabular-nums text-subtle">
          +{rest}
        </span>
      )}
    </div>
  );
}

// --- Learned baselines ---

const LEARNED_TONE: Record<
  "ok" | "warning" | "critical",
  { dot: string; text: string; ring: string; chip: string; chipText: string }
> = {
  ok: {
    dot: "bg-ok",
    text: "text-ok",
    ring: "border-ok/30",
    chip: "bg-ok/10",
    chipText: "text-ok",
  },
  warning: {
    dot: "bg-warning",
    text: "text-warning",
    ring: "border-warning/30",
    chip: "bg-warning/12",
    chipText: "text-warning",
  },
  critical: {
    dot: "bg-critical",
    text: "text-critical",
    ring: "border-critical/30",
    chip: "bg-critical/12",
    chipText: "text-critical",
  },
};

function LearnedSection({ health }: { health: WorkflowHealth }) {
  const allOk = health.learned.baselines.every((b) => b.tone === "ok");

  return (
    <section>
      <SectionHeading
        icon={Telescope}
        trailing={
          <span>
            {allOk ? "All metrics within baseline" : "Deviations detected"}
          </span>
        }
      >
        What we&apos;ve learned
      </SectionHeading>

      <p className="mt-2 text-[12.5px] leading-[1.55] text-muted">
        {health.learned.observationWindow}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {health.learned.baselines.map((b, i) => (
          <LearnedCard key={i} baseline={b} />
        ))}
      </div>
    </section>
  );
}

function LearnedCard({ baseline: b }: { baseline: LearnedBaseline }) {
  const tone = LEARNED_TONE[b.tone];

  return (
    <div className="rounded-[6px] border border-border bg-panel p-4">
      {/* Heading row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
          <span className="text-[12.5px] font-medium text-fg">{b.metric}</span>
        </div>
        <span
          className={cn(
            "rounded-sm border border-transparent px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.08em]",
            tone.chip,
            tone.chipText,
          )}
        >
          {b.tone === "ok" ? "Within baseline" : "Drifted"}
        </span>
      </div>

      {/* Comparison line */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[12.5px] tabular-nums">
        <span className="text-subtle">Was</span>
        <span className="text-muted">{b.baseline}</span>
        <span className="text-subtle">→ Now</span>
        <span className={cn("font-medium", b.tone === "ok" ? "text-fg" : tone.text)}>
          {b.current}
        </span>
      </div>

      {/* Visual */}
      {b.numeric && (
        <div className="mt-3.5">
          <MiniRangeBar numeric={b.numeric} tone={b.tone} />
        </div>
      )}
      {b.textDiff && (
        <div className="mt-3.5">
          <TextDiff diff={b.textDiff} />
        </div>
      )}

      {/* Deviation note */}
      <p
        className={cn(
          "mt-3 text-[12px] leading-[1.55]",
          b.tone === "ok" ? "text-muted" : tone.text,
        )}
      >
        {b.deviation}
      </p>
    </div>
  );
}

function MiniRangeBar({
  numeric,
  tone,
}: {
  numeric: NonNullable<LearnedBaseline["numeric"]>;
  tone: "ok" | "warning" | "critical";
}) {
  const max = numeric.scaleMax;
  const curPct = Math.min(100, Math.max(0, (numeric.currentValue / max) * 100));
  const baseRange = numeric.baselineRange;
  const baseStart = baseRange
    ? (baseRange[0] / max) * 100
    : (numeric.baselineValue / max) * 100;
  const baseEnd = baseRange
    ? (baseRange[1] / max) * 100
    : (numeric.baselineValue / max) * 100;
  const baseWidth = Math.max(0.4, baseEnd - baseStart);
  const baseLeft = Math.max(0, Math.min(100, baseStart));

  const markerColor =
    tone === "critical"
      ? "bg-critical"
      : tone === "warning"
      ? "bg-warning"
      : "bg-ok";

  return (
    <div>
      <div className="relative h-2 rounded-sm bg-panel-2">
        {/* Baseline range zone */}
        <div
          style={{ left: `${baseLeft}%`, width: `${baseWidth}%` }}
          className="absolute inset-y-0 rounded-sm bg-fg/22"
        />
        {/* Current marker */}
        <div
          style={{ left: `${curPct}%` }}
          className={cn(
            "absolute -inset-y-1 w-[3px] -translate-x-1/2 rounded-sm",
            markerColor,
          )}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] tabular-nums text-subtle">
        <span>0{numeric.unit ?? ""}</span>
        <span>
          {max}
          {numeric.unit ?? ""}
        </span>
      </div>
    </div>
  );
}

function TextDiff({
  diff,
}: {
  diff: NonNullable<LearnedBaseline["textDiff"]>;
}) {
  return (
    <div className="space-y-1.5 rounded-sm bg-panel-2 p-2.5">
      <div className="flex items-baseline gap-2">
        <span className="w-[60px] shrink-0 text-[9.5px] font-medium uppercase tracking-[0.08em] text-subtle">
          expected
        </span>
        <code className="font-mono text-[11px] text-muted">{diff.expected}</code>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="w-[60px] shrink-0 text-[9.5px] font-medium uppercase tracking-[0.08em] text-subtle">
          received
        </span>
        <code className="font-mono text-[11px] text-critical">
          {diff.received}
        </code>
      </div>
    </div>
  );
}

// --- Run composition ---

const RUN_SEGMENTS: {
  key: RunStatus;
  label: string;
  bar: string;
  dot: string;
}[] = [
  { key: "success", label: "Successful", bar: "bg-ok/75", dot: "bg-ok" },
  {
    key: "silent-failure",
    label: "Silent failure",
    bar: "bg-warning/75",
    dot: "bg-warning",
  },
  { key: "failed", label: "Failed", bar: "bg-critical/75", dot: "bg-critical" },
];

function RunComposition({ workflowId }: { workflowId: string }) {
  const runs = getRuns(workflowId);
  if (runs.length === 0) return null;

  const total = runs.length;
  const counts: Record<RunStatus, number> = {
    success: 0,
    "silent-failure": 0,
    failed: 0,
  };
  for (const r of runs) counts[r.status]++;

  const dominant = (Object.entries(counts) as [RunStatus, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const dominantPct = Math.round((dominant[1] / total) * 100);

  let interpretation = "";
  if (dominant[0] === "success" && dominantPct >= 90) {
    interpretation = "All recent runs are completing as expected.";
  } else if (dominant[0] === "silent-failure") {
    interpretation = `${dominantPct}% of recent runs reported success but produced no real output.`;
  } else if (dominant[0] === "failed") {
    interpretation = `${dominantPct}% of recent runs failed outright.`;
  }

  return (
    <section>
      <SectionHeading
        icon={BarChart3}
        trailing={<span className="tabular-nums">last {total} runs</span>}
      >
        Run composition
      </SectionHeading>
      <div className="mt-3 rounded-[6px] border border-border bg-panel p-5">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {RUN_SEGMENTS.map((seg) => {
            const count = counts[seg.key];
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={seg.key}
                className="flex items-center justify-between gap-3"
              >
                <dt className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", seg.dot)} />
                  <span className="text-[12.5px] text-muted">{seg.label}</span>
                </dt>
                <dd className="flex items-baseline gap-1.5 text-[12.5px] tabular-nums">
                  <span className="font-medium text-fg">{count}</span>
                  <span className="text-subtle">({pct}%)</span>
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-5 flex h-[10px] w-full overflow-hidden rounded-sm bg-panel-2">
          {RUN_SEGMENTS.map((seg) => {
            const count = counts[seg.key];
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div
                key={seg.key}
                style={{ width: `${pct}%` }}
                className={cn("h-full", seg.bar)}
                title={`${seg.label}: ${count}`}
              />
            );
          })}
        </div>

        {interpretation && (
          <p className="mt-3 text-[12.5px] leading-[1.55] text-muted">
            {interpretation}
          </p>
        )}
      </div>
    </section>
  );
}

// --- Health bar (unchanged) ---

function HealthBar({
  score,
  priorScore,
  barClass,
  scoreText,
}: {
  score: number;
  priorScore: number;
  barClass: string;
  scoreText: string;
}) {
  const cur = Math.max(0, Math.min(100, score));
  const prior = Math.max(0, Math.min(100, priorScore));
  const showGhost = Math.abs(prior - cur) >= 1;
  const liveWidth = Math.max(cur, 1.5);

  return (
    <div className="mt-4">
      <div className="relative h-2">
        <div className="absolute inset-0 overflow-hidden rounded-sm bg-panel-2">
          {showGhost && (
            <div
              style={{ width: `${prior}%` }}
              className="absolute inset-y-0 left-0 bg-fg/10"
            />
          )}
          <div
            style={{ width: `${liveWidth}%` }}
            className={cn("absolute inset-y-0 left-0", barClass)}
          />
        </div>
        {showGhost && (
          <div
            style={{ left: `${prior}%` }}
            className="absolute -top-1 -bottom-1 w-px bg-fg/45"
            aria-hidden
          />
        )}
      </div>

      <div className="relative mt-1.5 h-3 text-[10px] tabular-nums">
        <span
          className={cn(
            "absolute -translate-x-1/2 whitespace-nowrap font-medium uppercase tracking-[0.06em]",
            scoreText,
          )}
          style={{ left: `${cur}%` }}
        >
          now {cur}
        </span>
        {showGhost && (
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap uppercase tracking-[0.06em] text-subtle"
            style={{ left: `${prior}%` }}
          >
            was {prior}
          </span>
        )}
      </div>
    </div>
  );
}

// --- Health chart (unchanged) ---

function HealthChart({ health }: { health: WorkflowHealth }) {
  const data = health.timeline.map((p) => ({
    ts: new Date(p.at).getTime(),
    score: p.score,
  }));

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 28, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid
            stroke="hsl(var(--border) / 0.6)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            stroke="hsl(var(--subtle))"
            tick={{ fill: "hsl(var(--subtle))", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickFormatter={(v: number) =>
              new Date(v).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            minTickGap={32}
          />
          <YAxis
            domain={[0, 100]}
            stroke="hsl(var(--subtle))"
            tick={{ fill: "hsl(var(--subtle))", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 25, 50, 75, 100]}
            width={36}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--info))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "hsl(var(--info))" }}
            isAnimationActive={false}
          />
          {health.chartAnnotations.map((ann, i) => (
            <ReferenceLine
              key={i}
              x={new Date(ann.at).getTime()}
              stroke="hsl(var(--critical) / 0.55)"
              strokeDasharray="4 4"
              label={{
                value: ann.label,
                position: ann.side === "left" ? "insideTopRight" : "insideTopLeft",
                fill: "hsl(var(--critical))",
                fontSize: 11,
                fontWeight: 500,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
