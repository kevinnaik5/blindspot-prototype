"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  NodeToolbar,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { Workflow, WorkflowStep } from "@/data/workflows";
import { ServiceIcon, serviceLabel } from "./service-icon";
import { cn } from "@/lib/utils";

type StepState = WorkflowStep["state"];

const STATE_BORDER: Record<StepState, string> = {
  ok: "border-border",
  warning: "border-warning/55",
  error: "border-critical/55",
  idle: "border-border",
};

const STATE_RING: Record<StepState, string> = {
  ok: "",
  warning: "shadow-[0_0_0_1px_hsl(var(--warning)/0.25)]",
  error: "shadow-[0_0_0_1px_hsl(var(--critical)/0.3)]",
  idle: "",
};

const STATE_ICON: Record<
  StepState,
  { Icon: LucideIcon | null; color: string; label: string }
> = {
  ok: { Icon: CheckCircle2, color: "text-ok", label: "Healthy" },
  warning: { Icon: AlertTriangle, color: "text-warning", label: "Warning" },
  error: { Icon: AlertCircle, color: "text-critical", label: "Failing" },
  idle: { Icon: null, color: "", label: "Idle" },
};

const HANDLE_HIDDEN =
  "!h-px !w-px !min-h-0 !min-w-0 !border-0 !bg-transparent !opacity-0";

type StepNodeData = {
  label: string;
  service: string;
  serviceName: string;
  state: StepState;
  note?: string;
  hasIncoming: boolean;
  hasOutgoing: boolean;
  isHovered: boolean;
  onPopoverEnter: () => void;
  onPopoverLeave: () => void;
  onInspect: () => void;
};

function StepNode({ data }: NodeProps) {
  const d = data as unknown as StepNodeData;
  const meta = STATE_ICON[d.state];
  const StateIcon = meta.Icon;

  return (
    <>
      <NodeToolbar
        isVisible={d.isHovered}
        position={Position.Top}
        offset={10}
      >
        <div
          onMouseEnter={d.onPopoverEnter}
          onMouseLeave={d.onPopoverLeave}
          className="w-[280px] overflow-hidden rounded-[6px] border border-border-strong bg-panel-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-panel text-muted">
              <ServiceIcon service={d.service} className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-medium leading-tight text-fg">
                {d.label}
              </div>
              <div className="truncate text-[12px] text-subtle">
                {d.serviceName}
              </div>
            </div>
            {StateIcon && (
              <StateIcon
                className={cn("h-3.5 w-3.5", meta.color)}
                strokeWidth={1.85}
              />
            )}
          </div>

          <dl className="border-t border-border">
            <Row label="State" value={meta.label} valueClass={meta.color} />
            {d.note && (
              <Row label="Note" value={d.note} valueClass="text-fg" />
            )}
          </dl>

          <div className="flex justify-end border-t border-border bg-panel/60 px-3 py-2.5">
            <button
              onClick={d.onInspect}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-info-solid px-3 py-1.5 text-[12px] font-medium text-fg transition-colors hover:bg-info-solid/85"
            >
              Inspect
              <ArrowRight className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      </NodeToolbar>

      <div className="w-[224px]">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-md border bg-panel-2 p-3 transition-colors",
            STATE_BORDER[d.state],
            STATE_RING[d.state],
            d.isHovered && "border-muted/40",
          )}
        >
          {d.hasIncoming && (
            <Handle
              type="target"
              position={Position.Left}
              className={HANDLE_HIDDEN}
            />
          )}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-panel text-muted">
            <ServiceIcon service={d.service} className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium leading-tight text-fg">
              {d.label}
            </div>
            <div className="mt-0.5 truncate text-[12px] text-subtle">
              {d.serviceName}
            </div>
          </div>
          {StateIcon && (
            <StateIcon
              className={cn("h-3.5 w-3.5 shrink-0", meta.color)}
              strokeWidth={1.85}
            />
          )}
          {d.hasOutgoing && (
            <Handle
              type="source"
              position={Position.Right}
              className={HANDLE_HIDDEN}
            />
          )}
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3.5 py-2">
      <dt className="text-[12px] uppercase tracking-[0.06em] text-subtle">
        {label}
      </dt>
      <dd className={cn("max-w-[180px] text-right text-[12px]", valueClass)}>
        {value}
      </dd>
    </div>
  );
}

const nodeTypes = { step: StepNode };

export function WorkflowGraph({
  workflow,
  onInspect,
}: {
  workflow: Workflow;
  onInspect: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFor = useCallback((id: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHoveredId(id);
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setHoveredId(null), 180);
  }, []);

  // Precompute which nodes have incoming and outgoing edges so we only
  // render handles where they actually connect to something.
  const connectivity = useMemo(() => {
    const incoming = new Set<string>();
    const outgoing = new Set<string>();
    for (const e of workflow.edges) {
      outgoing.add(e.from);
      incoming.add(e.to);
    }
    return { incoming, outgoing };
  }, [workflow.edges]);

  const nodes = useMemo<Node[]>(
    () =>
      workflow.steps.map((step) => ({
        id: step.id,
        type: "step",
        position: workflow.positions[step.id] ?? { x: 0, y: 0 },
        data: {
          label: step.label,
          service: step.service,
          serviceName: serviceLabel(step.service),
          state: step.state,
          note: step.note,
          hasIncoming: connectivity.incoming.has(step.id),
          hasOutgoing: connectivity.outgoing.has(step.id),
          isHovered: step.id === hoveredId,
          onPopoverEnter: () => showFor(step.id),
          onPopoverLeave: scheduleClose,
          onInspect,
        },
        draggable: false,
        selectable: false,
      })),
    [workflow, connectivity, hoveredId, showFor, scheduleClose, onInspect],
  );

  const edges = useMemo<Edge[]>(
    () =>
      workflow.edges.map((e) => {
        const target = workflow.steps.find((s) => s.id === e.to);
        const errored = target?.state === "error";
        const warned = target?.state === "warning";
        const stroke = errored
          ? "hsl(var(--critical) / 0.55)"
          : warned
          ? "hsl(var(--warning) / 0.55)"
          : "hsl(var(--border-strong))";
        return {
          id: `${e.from}-${e.to}`,
          source: e.from,
          target: e.to,
          type: "smoothstep",
          style: { stroke, strokeWidth: 1.5 },
        };
      }),
    [workflow],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeMouseEnter={(_, node) => showFor(node.id)}
      onNodeMouseLeave={scheduleClose}
      fitView
      fitViewOptions={{ padding: 0.18 }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      panOnScroll
      minZoom={0.4}
      maxZoom={1.5}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={22}
        size={1.2}
        color="hsl(var(--muted) / 0.22)"
      />
    </ReactFlow>
  );
}
