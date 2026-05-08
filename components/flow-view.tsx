"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Workflow } from "@/data/workflows";
import type { RunStatus } from "@/data/runs";
import { ViewToggleBar, type FlowView as FlowViewKey } from "./view-toggle-bar";
import { GraphView } from "./views/graph-view";
import { StepView } from "./views/step-view";
import { TimelineView } from "./views/timeline-view";
import { RunHistoryView } from "./views/run-history-view";
import { WorkflowInspectDrawer } from "./workflow-inspect-drawer";
import { cn } from "@/lib/utils";

const FLOW_VIEW_KEYS: readonly FlowViewKey[] = [
  "step",
  "graph",
  "timeline",
  "run-history",
];

const RUN_STATUSES: readonly RunStatus[] = [
  "success",
  "silent-failure",
  "failed",
];

const DRAWER_WIDTH = 420;
const HEADER_HEIGHT = 40; // matches the view toggle bar's h-10

export function FlowView({
  workflow,
  initialView,
  initialRunStatus,
}: {
  workflow: Workflow;
  // Optional sub-view to land on (e.g. when crosslinked from Health's
  // run-composition into a status-scoped run history)
  initialView?: string;
  initialRunStatus?: string;
}) {
  const initialViewKey = (FLOW_VIEW_KEYS as readonly string[]).includes(
    initialView ?? "",
  )
    ? (initialView as FlowViewKey)
    : "step";
  const initialStatus = (RUN_STATUSES as readonly string[]).includes(
    initialRunStatus ?? "",
  )
    ? (initialRunStatus as RunStatus)
    : undefined;

  const [view, setView] = useState<FlowViewKey>(initialViewKey);
  const [open, setOpen] = useState(false);
  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* View toggle bar */}
      <ViewToggleBar
        view={view}
        onChangeView={setView}
        onOpenInspect={openDrawer}
      />

      {/* Canvas / view area. Padding-right makes room for the drawer when open. */}
      <div
        className="min-h-0 flex-1 transition-[padding] duration-300 ease-out"
        style={{ paddingRight: open ? DRAWER_WIDTH : 0 }}
      >
        <div className="h-full">
          {view === "step" && <StepView workflow={workflow} />}
          {view === "graph" && (
            <GraphView workflow={workflow} onInspect={openDrawer} />
          )}
          {view === "timeline" && <TimelineView workflow={workflow} />}
          {view === "run-history" && (
            <RunHistoryView
              workflow={workflow}
              initialStatus={initialStatus}
            />
          )}
        </div>
      </div>

      {/* Inspect drawer. Spans the full vertical area so its header sits
          flush with the view toggle bar instead of below it. */}
      <div
        aria-hidden={!open}
        className={cn(
          "absolute bottom-0 right-0 top-0 z-20 flex flex-col border-l border-border bg-panel transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ width: DRAWER_WIDTH }}
      >
        {/* Drawer header — matches the bar's height so the strip reads as one. */}
        <div
          className="flex shrink-0 items-center justify-between border-b border-border bg-bg pl-5 pr-2"
          style={{ height: HEADER_HEIGHT }}
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
            Inspect
          </span>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close inspect panel"
            className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-panel-2 hover:text-fg"
          >
            <X className="h-4 w-4" strokeWidth={1.85} />
          </button>
        </div>

        {/* Drawer content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WorkflowInspectDrawer workflow={workflow} />
        </div>
      </div>
    </div>
  );
}
