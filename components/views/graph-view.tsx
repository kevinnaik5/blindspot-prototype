"use client";

import type { Workflow } from "@/data/workflows";
import { WorkflowGraph } from "@/components/workflow-graph";

export function GraphView({
  workflow,
  onInspect,
}: {
  workflow: Workflow;
  onInspect: () => void;
}) {
  return (
    <div className="h-full">
      <WorkflowGraph workflow={workflow} onInspect={onInspect} />
    </div>
  );
}
