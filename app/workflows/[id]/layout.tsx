"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { DEMO_LOADED_WORKFLOWS, PLATFORM_LABEL } from "@/data/workflows";
import { getActions } from "@/data/actions";
import { relativeFromNow } from "@/lib/time";
import { useDemoLoaded } from "@/lib/demo";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { LensHeader } from "@/components/lens-header";
import { WorkflowBackLink } from "@/components/workflow-back-link";
import { cn } from "@/lib/utils";

export default function WorkflowLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const demoLoaded = useDemoLoaded();

  // Detail pages only resolve once the demo workflow has been loaded.
  // Before localStorage has been read, render nothing to avoid flashing
  // a "not found" briefly on refresh of a real route.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  const workflow = demoLoaded
    ? DEMO_LOADED_WORKFLOWS.find((w) => w.id === id)
    : undefined;
  if (!workflow) notFound();

  const failing = workflow.status !== "healthy";
  const actions = getActions(id);
  const hasUrgentAction = actions.some((a) => a.priority === "urgent");

  return (
    <div className="flex h-full flex-col">
      {/* Top chrome */}
      <div className="shrink-0 border-b border-border">
        <div className="px-8 pt-7 pb-5">
          <WorkflowBackLink />

          <h1 className="mt-4 text-[20px] font-medium leading-tight tracking-tightish text-fg">
            {workflow.name}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-muted">
            <span>
              Owned by <span className="text-fg">{workflow.owner.name}</span>
            </span>
            <Dot />
            <span>{PLATFORM_LABEL[workflow.platform]}</span>
            <Dot />
            <span>Last run {relativeFromNow(workflow.lastRunAt)}</span>
            <Dot />
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                failing ? "text-critical" : "text-ok",
              )}
            >
              {failing ? (
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.85} />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.85} />
              )}
              {workflow.statusLine}
            </span>
          </div>
        </div>

        <WorkflowTabs
          id={id}
          actionCount={actions.length}
          hasUrgentAction={hasUrgentAction}
        />
        <LensHeader id={id} />
      </div>

      {/* Tab content fills the remaining viewport */}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Dot() {
  return <span className="text-border-strong">·</span>;
}
