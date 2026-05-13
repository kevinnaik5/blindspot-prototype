import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Network,
  Target,
  Users,
} from "lucide-react";
import type {
  Dependency,
  DependencyHealth,
  SLO,
  SLOTone,
  Stakeholder,
  StakeholderRole,
  Workflow,
} from "@/data/workflows";
import { SectionHeading } from "@/components/section-label";
import { cn } from "@/lib/utils";

const TONE_TEXT: Record<SLOTone, string> = {
  ok: "text-ok",
  warning: "text-warning",
  critical: "text-critical",
};

const TONE_DOT: Record<SLOTone, string> = {
  ok: "bg-ok",
  warning: "bg-warning",
  critical: "bg-critical",
};

const TONE_LABEL: Record<SLOTone, string> = {
  ok: "Within target",
  warning: "Drifting",
  critical: "Violated",
};

const ROLE_LABEL: Record<StakeholderRole, string> = {
  owner: "Owner",
  escalation: "Escalation",
  consumer: "Consumer",
  approver: "Approver",
};

const HEALTH_TO_TONE: Record<DependencyHealth, SLOTone> = {
  ok: "ok",
  degraded: "warning",
  down: "critical",
};

export function IntentView({ workflow }: { workflow: Workflow }) {
  // Stakeholders fall back to just the owner when the workflow doesn't
  // declare a richer cast.
  const stakeholders: Stakeholder[] =
    workflow.stakeholders && workflow.stakeholders.length > 0
      ? workflow.stakeholders
      : [
          {
            name: workflow.owner.name,
            role: "owner",
            contact: workflow.owner.email,
          },
        ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-8 pb-12 pt-10">
        <PurposeSection workflow={workflow} />

        <div className="mt-10 space-y-10">
          {workflow.slos && workflow.slos.length > 0 && (
            <SLOsSection slos={workflow.slos} />
          )}

          <StakeholdersSection stakeholders={stakeholders} />

          <DependencyContractsSection deps={workflow.dependencies} />
        </div>
      </div>
    </div>
  );
}

// --- Purpose: prose-forward, no card chrome, large display headline ---

function PurposeSection({ workflow }: { workflow: Workflow }) {
  return (
    <section className="border-b border-border pb-9">
      <div className="flex items-center gap-2 text-subtle">
        <Compass className="h-3 w-3" strokeWidth={1.95} />
        <span className="text-[12px] font-medium uppercase tracking-[0.14em]">
          The goal
        </span>
      </div>
      {workflow.goal && (
        <h1 className="mt-4 max-w-[720px] text-[28px] font-medium leading-[1.3] tracking-tightish text-fg">
          {workflow.goal}
        </h1>
      )}
      <p className="mt-5 max-w-[680px] text-[16px] leading-[1.7] text-muted">
        {workflow.intent}
      </p>
    </section>
  );
}

// --- Service-level objectives ---

function SLOsSection({ slos }: { slos: SLO[] }) {
  return (
    <section>
      <SectionHeading icon={Target}>Service-level objectives</SectionHeading>
      <p className="mt-2 max-w-[760px] text-[12px] leading-[1.55] text-muted">
        What this workflow promises to the business. Health compares actuals
        against these targets.
      </p>
      <ul className="mt-4 overflow-hidden rounded-[6px] border border-border bg-panel">
        {slos.map((slo, i) => (
          <li
            key={i}
            className="border-b border-border p-4 last:border-b-0"
          >
            <SLOCard slo={slo} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SLOCard({ slo }: { slo: SLO }) {
  const tone = slo.tone ?? "ok";
  const isOk = tone === "ok";
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] font-medium leading-[1.4] text-fg">
            {slo.metric}
          </h4>
          <dl className="mt-2 space-y-1 text-[12px] leading-[1.55]">
            <div className="flex items-baseline gap-2">
              <dt className="w-[60px] shrink-0 text-[12px] font-medium uppercase tracking-[0.08em] text-subtle">
                Target
              </dt>
              <dd className="text-muted">{slo.target}</dd>
            </div>
            {slo.current && (
              <div className="flex items-baseline gap-2">
                <dt className="w-[60px] shrink-0 text-[12px] font-medium uppercase tracking-[0.08em] text-subtle">
                  Current
                </dt>
                <dd
                  className={cn(
                    "font-medium",
                    isOk ? "text-fg" : TONE_TEXT[tone],
                  )}
                >
                  {slo.current}
                </dd>
              </div>
            )}
          </dl>
          {slo.consequence && !isOk && (
            <p
              className={cn(
                "mt-2.5 text-[12px] leading-[1.55]",
                TONE_TEXT[tone],
              )}
            >
              {slo.consequence}
            </p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em]",
            TONE_TEXT[tone],
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[tone])} />
          {TONE_LABEL[tone]}
        </span>
      </div>
    </div>
  );
}

// --- Stakeholders ---

function StakeholdersSection({
  stakeholders,
}: {
  stakeholders: Stakeholder[];
}) {
  return (
    <section>
      <SectionHeading icon={Users}>Stakeholders</SectionHeading>
      <p className="mt-2 max-w-[760px] text-[12px] leading-[1.55] text-muted">
        Who depends on this workflow, and who answers when it breaks.
      </p>
      <ul className="mt-4 overflow-hidden rounded-[6px] border border-border bg-panel">
        {stakeholders.map((s, i) => (
          <li
            key={i}
            className="border-b border-border px-4 py-3 last:border-b-0"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium uppercase tracking-[0.1em] text-subtle">
                  {ROLE_LABEL[s.role]}
                </div>
                <div className="mt-1 text-[12px] font-medium text-fg">
                  {s.name}
                </div>
                {s.detail && (
                  <p className="mt-1 max-w-[600px] text-[12px] leading-[1.55] text-muted">
                    {s.detail}
                  </p>
                )}
              </div>
              {s.contact && (
                <span className="shrink-0 text-[12px] tabular-nums text-subtle">
                  {s.contact}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// --- Dependency contracts ---

function DependencyContractsSection({ deps }: { deps: Dependency[] }) {
  return (
    <section>
      <SectionHeading icon={Network}>Dependency contracts</SectionHeading>
      <p className="mt-2 max-w-[760px] text-[12px] leading-[1.55] text-muted">
        What this workflow expects from each upstream and downstream service.
        Contract status reflects whether the expectation is currently being
        met.
      </p>
      <ul className="mt-4 overflow-hidden rounded-[6px] border border-border bg-panel">
        {deps.map((dep, i) => (
          <li
            key={i}
            className="border-b border-border p-4 last:border-b-0"
          >
            <DependencyContractCard dep={dep} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function DependencyContractCard({ dep }: { dep: Dependency }) {
  const tone = HEALTH_TO_TONE[dep.health];
  const isOk = tone === "ok";
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[12px] font-medium text-fg">{dep.service}</h4>
          {dep.expectation && (
            <p className="mt-1.5 text-[12px] leading-[1.55] text-muted">
              <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-subtle">
                Expected{" "}
              </span>
              {dep.expectation}
            </p>
          )}
          {!isOk && dep.note && (
            <p className={cn("mt-1.5 text-[12px] leading-[1.55]", TONE_TEXT[tone])}>
              {dep.note}
            </p>
          )}
        </div>
        <DependencyHealthChip health={dep.health} />
      </div>
    </div>
  );
}

function DependencyHealthChip({ health }: { health: DependencyHealth }) {
  if (health === "ok") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-ok">
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.85} />
        Within contract
      </span>
    );
  }
  if (health === "degraded") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-warning">
        <AlertTriangle className="h-3 w-3" strokeWidth={1.85} />
        Drifting
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.06em] text-critical">
      <AlertCircle className="h-3 w-3" strokeWidth={1.85} />
      Broken
    </span>
  );
}
