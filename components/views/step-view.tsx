"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Circle,
  type LucideIcon,
} from "lucide-react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings2,
  History,
} from "lucide-react";
import type { Workflow, WorkflowStep } from "@/data/workflows";
import {
  getStepDetails,
  type StepExecutionStatus,
} from "@/data/step-details";
import { ServiceIcon, serviceLabel } from "@/components/service-icon";
import { SectionHeading } from "@/components/section-label";
import { relativeFromNow, shortDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

type StepState = WorkflowStep["state"];

const STATE_ICON: Record<
  StepState,
  { Icon: LucideIcon | null; color: string; label: string }
> = {
  ok: { Icon: CheckCircle2, color: "text-ok", label: "Healthy" },
  warning: { Icon: AlertTriangle, color: "text-warning", label: "Warning" },
  error: { Icon: AlertCircle, color: "text-critical", label: "Failing" },
  idle: { Icon: Circle, color: "text-subtle", label: "Idle" },
};

const EXEC_ICON: Record<
  StepExecutionStatus,
  { Icon: LucideIcon; color: string }
> = {
  ok: { Icon: CheckCircle2, color: "text-ok" },
  warning: { Icon: AlertTriangle, color: "text-warning" },
  error: { Icon: AlertCircle, color: "text-critical" },
};

function defaultStepId(workflow: Workflow): string {
  const failing = workflow.steps.find(
    (s) => s.state === "warning" || s.state === "error",
  );
  return failing?.id ?? workflow.steps[0]?.id ?? "";
}

// Build the breadcrumb-arrow shape per step position.
// All steps butt up against each other; the right point of step N
// fits into the left notch of step N+1.
const ARROW = 14;
function chevronClip(isFirst: boolean, isLast: boolean): string | undefined {
  if (isFirst && isLast) return undefined;
  const right = `calc(100% - ${ARROW}px)`;
  if (isFirst) {
    return `polygon(0 0, ${right} 0, 100% 50%, ${right} 100%, 0 100%)`;
  }
  if (isLast) {
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${ARROW}px 50%)`;
  }
  return `polygon(0 0, ${right} 0, 100% 50%, ${right} 100%, 0 100%, ${ARROW}px 50%)`;
}

// Two-layer styling: the step's status colors the chevron's background
// (so failing/warning steps read as affected even when not selected),
// and selection saturates the same hue (so the selected step glows).
function stepTone(
  state: StepState,
  active: boolean,
): { bg: string; text: string } {
  if (state === "error") {
    return active
      ? { bg: "bg-critical/45", text: "text-fg" }
      : { bg: "bg-critical/25 hover:bg-critical/35", text: "text-fg/80 hover:text-fg" };
  }
  if (state === "warning") {
    return active
      ? { bg: "bg-warning/45", text: "text-fg" }
      : { bg: "bg-warning/25 hover:bg-warning/35", text: "text-fg/80 hover:text-fg" };
  }
  return active
    ? { bg: "bg-info/40", text: "text-fg" }
    : { bg: "bg-panel-2 hover:bg-panel", text: "text-muted hover:text-fg" };
}

export function StepView({ workflow }: { workflow: Workflow }) {
  const [selectedId, setSelectedId] = useState(() =>
    defaultStepId(workflow),
  );
  const selected =
    workflow.steps.find((s) => s.id === selectedId) ?? workflow.steps[0];
  const details = getStepDetails(workflow.id, selected.id);
  const meta = STATE_ICON[selected.state];
  const StateIcon = meta.Icon;

  return (
    <div className="flex h-full flex-col">
      {/* Step picker — chevron breadcrumb strip */}
      <div className="shrink-0 border-b border-border bg-bg">
        <div className="flex px-3 py-4">
          {workflow.steps.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === workflow.steps.length - 1;
            const active = step.id === selected.id;
            const m = STATE_ICON[step.state];
            const Icon = m.Icon;
            const tone = stepTone(step.state, active);
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setSelectedId(step.id)}
                style={{ clipPath: chevronClip(isFirst, isLast) }}
                className={cn(
                  "flex flex-1 items-center justify-between gap-2 whitespace-nowrap py-2.5 text-[12px] font-medium transition-colors",
                  // Overlap by less than the arrow depth so a small
                  // V-shaped gap stays visible between chevrons.
                  !isFirst && "-ml-[10px]",
                  isFirst ? "pl-3" : "pl-5",
                  isLast ? "pr-3" : "pr-5",
                  tone.bg,
                  tone.text,
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "text-[10.5px] tabular-nums",
                      active ? "text-fg/70" : "text-subtle",
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <ServiceIcon
                    service={step.service}
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      active ? "text-fg" : "text-subtle",
                    )}
                  />
                  <span className="truncate">{step.label}</span>
                </div>
                {Icon && step.state !== "ok" && (
                  <Icon
                    className={cn("h-3 w-3 shrink-0", m.color)}
                    strokeWidth={1.95}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Details */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-7 px-6 py-7">
          {/* Step header */}
          <header className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-panel-2 text-muted">
              <ServiceIcon service={selected.service} className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-medium leading-tight tracking-tightish text-fg">
                {selected.label}
              </h2>
              <div className="mt-1 text-[12px] text-muted">
                {serviceLabel(selected.service)}
                <span className="mx-1.5 text-border-strong">·</span>
                <span className="capitalize">{selected.id} step</span>
              </div>
            </div>
            {StateIcon && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11.5px] font-medium",
                  selected.state === "warning" &&
                    "border-warning/35 bg-warning/10 text-warning",
                  selected.state === "error" &&
                    "border-critical/35 bg-critical/10 text-critical",
                  selected.state === "ok" &&
                    "border-ok/30 bg-ok/10 text-ok",
                  selected.state === "idle" &&
                    "border-border bg-panel text-muted",
                )}
              >
                <StateIcon className="h-3.5 w-3.5" strokeWidth={1.85} />
                {meta.label}
              </span>
            )}
          </header>

          {selected.note && (
            <div
              className={cn(
                "relative rounded-[6px] border bg-panel p-3.5 pl-4",
                selected.state === "error"
                  ? "border-critical/30"
                  : selected.state === "warning"
                  ? "border-warning/30"
                  : "border-border",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-0 h-full w-[2px]",
                  selected.state === "error" && "bg-critical",
                  selected.state === "warning" && "bg-warning",
                  selected.state === "ok" && "bg-ok",
                )}
              />
              <p className="text-[13px] leading-[1.55] text-fg">
                {selected.note}
              </p>
            </div>
          )}

          {!details ? (
            <div className="rounded-[6px] border border-border bg-panel px-4 py-6 text-center text-[12.5px] text-subtle">
              No detailed inputs/outputs captured for this step yet.
            </div>
          ) : (
            <>
              {/* Inputs */}
              <section>
                <SectionHeading icon={ArrowDownToLine}>Inputs</SectionHeading>
                <dl className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
                  {details.inputs.map((input, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-4 border-b border-border px-4 py-2.5 last:border-b-0"
                    >
                      <dt className="shrink-0 text-[12px] text-muted">
                        {input.label}
                      </dt>
                      <dd
                        className={cn(
                          "max-w-[60%] truncate text-right text-[12px] text-fg",
                          input.secret && "font-mono tracking-wider",
                        )}
                        title={input.value}
                      >
                        {input.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Last output: received vs expected side by side */}
              <section>
                <div className="flex items-baseline justify-between">
                  <SectionHeading icon={ArrowUpFromLine}>
                    Last output
                  </SectionHeading>
                  <span className="text-[11px] text-subtle">
                    Last run {relativeFromNow(workflow.lastRunAt)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <CodePanel
                    label="Received"
                    tone={
                      selected.state === "ok"
                        ? "ok"
                        : selected.state === "warning"
                        ? "warning"
                        : "critical"
                    }
                    code={details.output.received}
                  />
                  {details.output.expected && (
                    <CodePanel
                      label="Expected"
                      tone="muted"
                      code={details.output.expected}
                    />
                  )}
                </div>
              </section>

              {/* Configuration */}
              <section>
                <SectionHeading icon={Settings2}>
                  Configuration
                </SectionHeading>
                <dl className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
                  {details.config.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5 last:border-b-0"
                    >
                      <dt className="text-[12px] text-muted">{c.label}</dt>
                      <dd className="text-[12px] text-fg">{c.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Recent executions */}
              <section>
                <SectionHeading icon={History}>
                  Recent executions
                </SectionHeading>
                <ul className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
                  {details.recent.map((exec, i) => {
                    const e = EXEC_ICON[exec.status];
                    const Icon = e.Icon;
                    return (
                      <li
                        key={i}
                        className="grid grid-cols-[120px_18px_1fr_auto] items-center gap-3 border-b border-border px-4 py-2 last:border-b-0"
                      >
                        <div className="text-[11.5px] tabular-nums text-subtle">
                          {shortDateTime(exec.at)}
                        </div>
                        <Icon
                          className={cn("h-3.5 w-3.5", e.color)}
                          strokeWidth={1.85}
                        />
                        <div className="min-w-0 truncate text-[12.5px] text-fg">
                          {exec.detail}
                          {exec.firstFailure && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-sm border border-critical/40 bg-critical/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.08em] text-critical">
                              First
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] tabular-nums text-subtle">
                          {relativeFromNow(exec.at)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CodePanel({
  label,
  tone,
  code,
}: {
  label: string;
  tone: "ok" | "warning" | "critical" | "muted";
  code: string;
}) {
  const accent =
    tone === "ok"
      ? "border-ok/30"
      : tone === "warning"
      ? "border-warning/30"
      : tone === "critical"
      ? "border-critical/30"
      : "border-border";
  const dotColor =
    tone === "ok"
      ? "bg-ok"
      : tone === "warning"
      ? "bg-warning"
      : tone === "critical"
      ? "bg-critical"
      : "bg-subtle";

  return (
    <div
      className={cn("overflow-hidden rounded-[6px] border bg-panel", accent)}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
          <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
            {label}
          </span>
        </div>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-3 font-mono text-[11.5px] leading-[1.55] text-muted">
        {code}
      </pre>
    </div>
  );
}
