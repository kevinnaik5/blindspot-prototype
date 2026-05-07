"use client";

import {
  BookOpen,
  Activity,
  History,
  Network,
  Zap,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  type Workflow,
  type IndicatorTone,
  type DependencyHealth,
} from "@/data/workflows";
import { SectionHeading } from "./section-label";
import { HandoffLink } from "./handoff-link";
import { relativeFromNow, shortDateTime } from "@/lib/time";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<IndicatorTone, string> = {
  critical: "text-critical",
  warning: "text-warning",
  info: "text-info",
  ok: "text-ok",
  muted: "text-muted",
};

// Body of the inspect panel. The header chrome (INSPECT label + close)
// is rendered by FlowView so it can align with the view toggle bar.
export function WorkflowInspectDrawer({
  workflow,
}: {
  workflow: Workflow;
}) {
  const failing = workflow.status !== "healthy";
  return (
    <div className="space-y-8 px-5 py-6">
      {/* Purpose */}
      <section>
        <SectionHeading icon={BookOpen}>Purpose</SectionHeading>
        <p className="mt-3 text-[13.5px] leading-[1.6] text-muted">
          {workflow.intent}
        </p>
      </section>

      {/* Trigger and cadence */}
      <section>
        <SectionHeading icon={Zap}>Trigger and cadence</SectionHeading>
        <dl className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
          <Row label="Trigger" value={workflow.cadence.trigger} />
          <Row label="Volume" value={workflow.cadence.volume} />
        </dl>
      </section>

      {/* Current state */}
      <section>
        <SectionHeading icon={Activity}>Current state</SectionHeading>
        <div
          className={cn(
            "mt-3 overflow-hidden rounded-[6px] border bg-panel",
            failing ? "border-critical/30" : "border-border",
          )}
        >
          <div className="relative px-4 py-3.5 pl-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-full w-[2px]",
                failing ? "bg-critical" : "bg-ok",
              )}
            />
            <p className="text-[13.5px] font-medium leading-[1.5] text-fg">
              {workflow.currentState.headline}
            </p>
            {workflow.currentState.detail && (
              <p className="mt-1.5 text-[12.5px] leading-[1.55] text-muted">
                {workflow.currentState.detail}
              </p>
            )}
          </div>
          {workflow.currentState.indicators.length > 0 && (
            <dl className="border-t border-border">
              {workflow.currentState.indicators.map((ind) => (
                <div
                  key={ind.label}
                  className="flex items-center justify-between border-b border-border/60 px-4 py-2 last:border-b-0"
                >
                  <dt className="text-[11.5px] text-muted">{ind.label}</dt>
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
          )}
        </div>
      </section>

      {/* What changed */}
      <section>
        <SectionHeading icon={History}>What changed</SectionHeading>
        {workflow.changes.length === 0 ? (
          <p className="mt-3 text-[12.5px] text-subtle">
            No modifications in the last 30 days.
          </p>
        ) : (
          <ul className="mt-3 space-y-3.5">
            {workflow.changes.map((change, idx) => (
              <li
                key={idx}
                className={cn(
                  "grid grid-cols-[110px_minmax(0,1fr)] gap-3 rounded-[6px] border p-3 transition-colors",
                  change.significant
                    ? "border-critical/35 bg-critical/8"
                    : "border-transparent",
                )}
              >
                <div className="text-[11.5px] tabular-nums text-subtle">
                  <div>{shortDateTime(change.at)}</div>
                  <div className="mt-0.5 text-[11px] text-subtle/80">
                    {relativeFromNow(change.at)}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {change.who && (
                      <span
                        className={cn(
                          "text-[12.5px] font-medium",
                          change.significant ? "text-critical" : "text-fg",
                        )}
                      >
                        {change.who}
                      </span>
                    )}
                    {change.significant && (
                      <span className="inline-flex items-center gap-1 rounded-sm border border-critical/40 bg-critical/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.08em] text-critical">
                        <AlertCircle
                          className="h-2.5 w-2.5"
                          strokeWidth={2}
                        />
                        Likely cause
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-[13px] leading-[1.55]",
                      change.significant ? "text-fg" : "text-muted",
                    )}
                  >
                    {change.summary}
                  </p>
                  {change.suggestedActionId && (
                    <div className="mt-2 flex justify-end">
                      <HandoffLink
                        workflowId={workflow.id}
                        actionId={change.suggestedActionId}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Dependencies */}
      <section>
        <SectionHeading icon={Network}>Dependencies</SectionHeading>
        <ul className="mt-3 overflow-hidden rounded-[6px] border border-border bg-panel">
          {workflow.dependencies.map((dep) => (
            <li
              key={dep.service}
              className="border-b border-border last:border-b-0"
            >
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] font-medium text-fg">
                  {dep.service}
                </span>
                <HealthLabel health={dep.health} />
              </div>
              {dep.note && (
                <div className="border-t border-border/60 px-4 py-2 text-[11.5px] text-muted">
                  {dep.note}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-b-0">
      <span className="text-[12px] text-muted">{label}</span>
      <span className="text-[12.5px] font-medium text-fg">{value}</span>
    </div>
  );
}

function HealthLabel({ health }: { health: DependencyHealth }) {
  if (health === "ok") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-ok">
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.85} />
        Healthy
      </span>
    );
  }
  if (health === "degraded") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-warning">
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.85} />
        Degraded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-critical">
      <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.85} />
      Down
    </span>
  );
}
