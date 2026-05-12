"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Pause,
  Play,
  Bell,
  RotateCcw,
  ExternalLink,
  UserPlus,
  ShieldCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  Info,
  Lightbulb,
  ListChecks,
  Undo2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Workflow } from "@/data/workflows";
import {
  getActions,
  PRIORITY_ORDER,
  type ActionRecommendation,
  type ActionPriority,
  type ActionStyle,
  type ActionIcon,
} from "@/data/actions";
import { SectionHeading } from "@/components/section-label";
import { FocusableActionItem } from "@/components/views/focusable-action-item";
import { ActionSheet } from "@/components/actions/action-sheet";
import { cn } from "@/lib/utils";

const ICONS: Record<ActionIcon, LucideIcon> = {
  pause: Pause,
  play: Play,
  bell: Bell,
  "rotate-ccw": RotateCcw,
  "external-link": ExternalLink,
  "user-plus": UserPlus,
  "shield-check": ShieldCheck,
  "calendar-clock": CalendarClock,
};

const PRIORITY_DOT: Record<ActionPriority, string> = {
  urgent: "bg-critical",
  recommended: "bg-warning",
  optional: "bg-subtle",
};

const PRIORITY_LABEL: Record<ActionPriority, string> = {
  urgent: "Urgent",
  recommended: "Recommended",
  optional: "Optional",
};

type CommittedState = {
  at: number;
  // The exact scope + swap selections the operator chose at commit time.
  // Surfacing these in the committed UI honors the Fine-Grained Control
  // and Swappable Components properties, the choices are visible, not
  // discarded once the action moves out of the configure sheet.
  selections: Record<string, string>;
};

function buildConfigSummary(
  action: ActionRecommendation,
  selections: Record<string, string>,
): string[] {
  const interactive = action.interactive;
  if (!interactive) return [];
  const parts: string[] = [];
  for (const f of interactive.scope) {
    const key = selections[f.id] ?? f.defaultKey;
    const opt = f.options.find((o) => o.key === key);
    if (opt) parts.push(opt.label);
  }
  for (const s of interactive.swappable) {
    const key = selections[s.id] ?? s.defaultKey;
    const opt = s.options.find((o) => o.key === key);
    if (opt) parts.push(opt.label);
  }
  return parts;
}

export function ActionsView({ workflow }: { workflow: Workflow }) {
  const router = useRouter();
  const pathname = usePathname();

  const actions = [...getActions(workflow.id)].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [committed, setCommitted] = useState<Record<string, CommittedState>>(
    {},
  );

  const openAction = openActionId
    ? actions.find((a) => a.id === openActionId) ?? null
    : null;

  const handleCommit = (selections: Record<string, string>) => {
    if (!openActionId) return;
    setCommitted((prev) => ({
      ...prev,
      [openActionId]: { at: Date.now(), selections },
    }));
    setOpenActionId(null);
  };

  const handleUndo = (actionId: string) => {
    setCommitted((prev) => {
      const next = { ...prev };
      delete next[actionId];
      return next;
    });
  };

  const handleJumpTo = (actionId: string) => {
    router.replace(`${pathname}?focus=${actionId}`, { scroll: false });
  };

  if (actions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-[320px] text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-subtle">
            Actions
          </div>
          <div className="mt-2 text-[13px] text-muted">
            No actions recommended for this workflow.
          </div>
        </div>
      </div>
    );
  }

  // The hero is whichever interactive action is up next (first one in
  // priority order that hasn't been committed yet). Once an action is
  // committed, the hero re-points to the following step automatically.
  const heroAction = actions.find(
    (a) => a.interactive !== undefined && committed[a.id] === undefined,
  );
  const heroId = heroAction?.id ?? null;
  const others = heroId ? actions.filter((a) => a.id !== heroId) : actions;

  const failing = workflow.status !== "healthy";
  const allDone = actions.every((a) =>
    a.interactive ? committed[a.id] !== undefined : true,
  );

  let recap: string;
  if (allDone && failing) {
    recap =
      "All recommended steps complete. Watch Health for the workflow's recovery and unwind the actions when it's safe.";
  } else if (failing) {
    recap = [workflow.currentState.headline, workflow.currentState.detail]
      .filter(Boolean)
      .join(" ");
  } else {
    recap =
      "Proactive suggestions for keeping this workflow healthy. Nothing here is urgent.";
  }

  return (
    <div className="flex h-full">
      {/* Main column */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="space-y-7 px-8 py-8">
          <header>
            <SectionHeading
              icon={Lightbulb}
              trailing={<span className="tabular-nums">{actions.length}</span>}
            >
              Recommended actions
            </SectionHeading>
            <p className="mt-2 max-w-[760px] text-[13px] leading-[1.6] text-muted">
              {recap}
            </p>
          </header>

          <Suspense fallback={null}>
            {heroAction && (
              <FocusableActionItem actionId={heroAction.id}>
                <NextStepHero
                  action={heroAction}
                  committed={committed[heroAction.id] ?? null}
                  onActivate={() => setOpenActionId(heroAction.id)}
                  onUndo={() => handleUndo(heroAction.id)}
                />
              </FocusableActionItem>
            )}

            {others.length > 0 && (
              <section>
                {heroAction && (
                  <div className="mb-3 text-[10.5px] font-medium uppercase tracking-[0.1em] text-subtle">
                    Other actions
                  </div>
                )}
                <div className="space-y-2">
                  {others.map((action) => (
                    <FocusableActionItem key={action.id} actionId={action.id}>
                      <CompactActionRow
                        action={action}
                        committed={committed[action.id] ?? null}
                        onActivate={() => {
                          if (action.actionStyle === "external") return;
                          if (!action.interactive) return;
                          setOpenActionId(action.id);
                        }}
                        onUndo={() => handleUndo(action.id)}
                      />
                    </FocusableActionItem>
                  ))}
                </div>
              </section>
            )}
          </Suspense>
        </div>
      </div>

      {/* Right rail: checklist */}
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-border bg-bg lg:block">
        <div className="px-5 py-6">
          <StepsChecklist
            actions={actions}
            committed={committed}
            heroId={heroId}
            onJumpTo={handleJumpTo}
          />
        </div>
      </aside>

      <ActionSheet
        open={openActionId !== null}
        action={openAction}
        onClose={() => setOpenActionId(null)}
        onCommit={handleCommit}
      />
    </div>
  );
}

// --- Hero card: featured "next step" treatment ---

function NextStepHero({
  action,
  committed,
  onActivate,
  onUndo,
}: {
  action: ActionRecommendation;
  committed: CommittedState | null;
  onActivate: () => void;
  onUndo: () => void;
}) {
  const Icon = ICONS[action.icon];
  const interactive = action.interactive;
  const isCommitted = committed !== null && interactive !== undefined;
  const destructive = action.actionStyle === "destructive";

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[8px] border bg-panel",
        isCommitted
          ? "border-ok/40 bg-ok/5"
          : destructive
          ? "border-critical/35"
          : "border-info/35",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-[3px]",
          isCommitted ? "bg-ok" : destructive ? "bg-critical" : "bg-info",
        )}
        aria-hidden
      />

      <div className="px-7 py-7">
        <div className="flex items-center gap-2">
          {isCommitted && interactive ? (
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-ok">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2} />
              {interactive.committedLabel}
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em]",
                destructive ? "text-critical" : "text-info",
              )}
            >
              <ArrowRight className="h-3 w-3" strokeWidth={2.4} />
              Recommended next step
            </span>
          )}
          <span className="text-[10.5px] uppercase tracking-[0.1em] text-subtle">
            · {isCommitted ? "Just now" : "Start here"}
          </span>
        </div>

        <h3 className="mt-3 max-w-[640px] text-[20px] font-medium leading-[1.3] tracking-tightish text-fg">
          {action.title}
        </h3>

        <p className="mt-2.5 max-w-[680px] text-[13.5px] leading-[1.6] text-muted">
          {isCommitted && interactive?.committedDetail
            ? interactive.committedDetail
            : action.rationale}
        </p>

        {isCommitted && interactive && committed && (
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border pt-4 text-[11.5px]">
            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-subtle">
              Configured
            </span>
            {buildConfigSummary(action, committed.selections).map(
              (label, idx, arr) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 text-fg/85"
                >
                  {label}
                  {idx < arr.length - 1 && (
                    <span className="text-border-strong">·</span>
                  )}
                </span>
              ),
            )}
          </div>
        )}

        {!isCommitted &&
          interactive &&
          interactive.guardrails.affected.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4 text-[11.5px]">
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-subtle">
                Impact
              </span>
              {interactive.guardrails.affected.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-muted"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.tone === "critical"
                        ? "bg-critical"
                        : item.tone === "warning"
                        ? "bg-warning"
                        : "bg-subtle",
                    )}
                  />
                  {item.label}
                </span>
              ))}
              <span className="ml-auto inline-flex items-center gap-1.5 text-ok">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.95} />
                Reversible
              </span>
            </div>
          )}

        <div className="mt-6 flex items-center gap-3">
          {isCommitted && interactive ? (
            <button
              type="button"
              onClick={onUndo}
              className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-panel-2 px-4 py-2 text-[13px] font-medium text-fg transition-colors hover:border-muted/40 hover:bg-panel"
            >
              <Undo2 className="h-3.5 w-3.5" strokeWidth={1.85} />
              {interactive.undoLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onActivate}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-[13px] font-medium transition-colors",
                destructive
                  ? "border-critical/55 bg-critical/15 text-fg hover:border-critical/70 hover:bg-critical/25"
                  : "border-info/55 bg-info/15 text-fg hover:border-info/70 hover:bg-info/25",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.85} />
              {action.actionLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// --- Compact row (expandable) for the "Other actions" list ---

function CompactActionRow({
  action,
  committed,
  onActivate,
  onUndo,
}: {
  action: ActionRecommendation;
  committed: CommittedState | null;
  onActivate: () => void;
  onUndo: () => void;
}) {
  const Icon = ICONS[action.icon];
  const interactive = action.interactive;
  const isExternal = action.actionStyle === "external";
  const isCommitted = committed !== null && interactive !== undefined;
  const [expanded, setExpanded] = useState(false);

  // Compact subtitle: pull a short hint from context if present.
  const meta = action.context?.slice(0, 2).join(" · ") ?? null;

  const toggle = () => setExpanded((v) => !v);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[6px] border bg-panel transition-colors",
        isCommitted
          ? "border-ok/30 bg-ok/5"
          : expanded
          ? "border-muted/40"
          : "border-border hover:border-muted/40",
      )}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-panel-2/40"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              isCommitted ? "bg-ok" : PRIORITY_DOT[action.priority],
            )}
            aria-hidden
            title={
              isCommitted
                ? interactive?.committedLabel
                : PRIORITY_LABEL[action.priority]
            }
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={cn(
                  "truncate text-[13px] font-medium",
                  isCommitted ? "text-fg/85" : "text-fg",
                )}
              >
                {action.title}
              </h4>
              {isCommitted && interactive && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-ok/15 px-1.5 py-px text-[10px] font-medium uppercase tracking-[0.06em] text-ok">
                  <CheckCircle2 className="h-2.5 w-2.5" strokeWidth={2.2} />
                  {interactive.committedLabel}
                </span>
              )}
            </div>
            {!expanded &&
              (meta ||
                (isCommitted && (committed || interactive?.committedDetail))) && (
                <div className="mt-0.5 truncate text-[11.5px] text-subtle">
                  {isCommitted && committed
                    ? buildConfigSummary(action, committed.selections).join(
                        " · ",
                      ) || interactive?.committedDetail
                    : meta}
                </div>
              )}
          </div>

          <Info
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-colors",
              expanded ? "text-fg" : "text-subtle",
            )}
            strokeWidth={1.85}
            aria-label={expanded ? "Hide details" : "Show details"}
          />
        </button>

        <div className="flex shrink-0 items-center pr-4">
          {isCommitted && interactive ? (
            <button
              type="button"
              onClick={onUndo}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-panel-2 px-2.5 py-1 text-[12px] font-medium text-fg transition-colors hover:border-muted/40 hover:bg-panel"
            >
              <Undo2 className="h-3 w-3" strokeWidth={1.85} />
              {interactive.undoLabel}
            </button>
          ) : isExternal ? (
            <button
              type="button"
              onClick={onActivate}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-2 px-2.5 py-1 text-[12px] font-medium text-muted transition-colors hover:bg-panel hover:text-fg"
            >
              <Icon className="h-3 w-3" strokeWidth={1.85} />
              {action.actionLabel}
              <ExternalLink className="h-2.5 w-2.5" strokeWidth={1.85} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onActivate}
              className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-panel-2 px-2.5 py-1 text-[12px] font-medium text-fg transition-colors hover:border-muted/40 hover:bg-panel"
            >
              <Icon className="h-3 w-3" strokeWidth={1.85} />
              {action.actionLabel}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3.5">
          <p className="max-w-[680px] text-[12.5px] leading-[1.6] text-muted">
            {action.rationale}
          </p>

          {action.context && action.context.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {action.context.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-sm border border-border bg-panel-2 px-2 py-0.5 text-[11px] text-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {interactive && interactive.guardrails.affected.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[11.5px]">
              <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-subtle">
                Impact
              </span>
              {interactive.guardrails.affected.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-muted"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.tone === "critical"
                        ? "bg-critical"
                        : item.tone === "warning"
                        ? "bg-warning"
                        : "bg-subtle",
                    )}
                  />
                  {item.label}
                </span>
              ))}
              <span className="ml-auto inline-flex items-center gap-1.5 text-ok">
                <ShieldCheck className="h-3 w-3" strokeWidth={1.95} />
                Reversible
              </span>
            </div>
          )}

          {isExternal && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-subtle">
              <ExternalLink className="h-3 w-3" strokeWidth={1.85} />
              Opens in Zapier
            </p>
          )}
        </div>
      )}
    </article>
  );
}

// --- Right-rail checklist ---

function StepsChecklist({
  actions,
  committed,
  heroId,
  onJumpTo,
}: {
  actions: ActionRecommendation[];
  committed: Record<string, CommittedState>;
  heroId: string | null;
  onJumpTo: (actionId: string) => void;
}) {
  // Only count interactive actions toward "complete", externals like
  // Open-in-Zapier never resolve in this app.
  const trackable = actions.filter((a) => a.interactive !== undefined);
  const total = trackable.length;
  const done = trackable.filter((a) => committed[a.id] !== undefined).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="sticky top-0">
      <div className="flex items-center gap-2 text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted">
        <ListChecks className="h-3.5 w-3.5" strokeWidth={1.85} />
        Steps
      </div>

      <div className="mt-2 flex items-baseline gap-2 tabular-nums">
        <span className="text-[18px] font-medium text-fg">{done}</span>
        <span className="text-[11.5px] text-subtle">
          of {total} complete · {pct}%
        </span>
      </div>

      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-sm bg-panel-2">
        <div
          style={{ width: `${pct}%` }}
          className="h-full bg-ok transition-[width] duration-300"
        />
      </div>

      <ol className="mt-5">
        {actions.map((action, idx) => {
          const isDone = committed[action.id] !== undefined;
          const isNext = action.id === heroId;
          const isExternal = action.actionStyle === "external";
          const isLast = idx === actions.length - 1;

          return (
            <li key={action.id} className="relative">
              {/* Connector line that joins this step's dot to the next.
                  Anchored to circle edges (top-6 = this circle bottom,
                  -bottom-2 = next circle top), so the line lives purely
                  in the gap and never overlaps the circle itself.
                  Coloured ok when the segment is "behind" us, i.e. this
                  step is done. */}
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-4 top-6 -bottom-2 z-0 w-px -translate-x-1/2",
                    isDone ? "bg-ok/60" : "bg-border-strong",
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => onJumpTo(action.id)}
                className="flex w-full items-start gap-2.5 px-2 py-2 text-left"
              >
                <span
                  className={cn(
                    "relative z-10 mt-[1px] inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                    isDone
                      ? "bg-ok text-bg"
                      : isNext
                      ? "border border-info bg-info/15"
                      : "border border-border bg-panel-2",
                  )}
                  aria-hidden
                >
                  {isDone && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>

                <span
                  className={cn(
                    "-my-1 min-w-0 flex-1 rounded-md px-2.5 py-1 transition-colors",
                    isNext
                      ? "bg-info/8 ring-1 ring-info/30"
                      : "hover:bg-panel-2/60",
                  )}
                >
                  <span
                    className={cn(
                      "block text-[12px] leading-[1.45]",
                      isDone
                        ? "text-muted line-through decoration-muted/40"
                        : isNext
                        ? "font-medium text-fg"
                        : "text-muted",
                    )}
                  >
                    {action.title}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em]">
                    <span
                      className={cn(
                        "tabular-nums",
                        isNext ? "text-info" : "text-subtle",
                      )}
                    >
                      Step {String(idx + 1).padStart(2, "0")}
                    </span>
                    {isNext && !isDone && (
                      <span className="font-medium text-info">Next step</span>
                    )}
                    {isDone && <span className="text-ok">Done</span>}
                    {isExternal && !isDone && (
                      <span className="text-subtle">External</span>
                    )}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
