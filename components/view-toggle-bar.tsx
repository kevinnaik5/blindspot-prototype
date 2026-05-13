"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowView = "step" | "graph" | "timeline" | "run-history";

const VIEWS: {
  key: FlowView;
  label: string;
  // Disabled views are rendered but not clickable yet
  disabled?: boolean;
}[] = [
  { key: "step", label: "Step" },
  { key: "graph", label: "Node" },
  { key: "timeline", label: "Timeline" },
  { key: "run-history", label: "Run history" },
];

export function ViewToggleBar({
  view,
  onChangeView,
  onOpenInspect,
}: {
  view: FlowView;
  onChangeView: (next: FlowView) => void;
  onOpenInspect: () => void;
}) {
  return (
    <div className="flex h-10 shrink-0 items-stretch border-b border-border bg-bg">
      {/* View toggles */}
      <div className="flex items-stretch divide-x divide-border border-r border-border">
        {VIEWS.map((v) => {
          const active = v.key === view;
          return (
            <button
              key={v.key}
              type="button"
              disabled={v.disabled}
              onClick={() => !v.disabled && onChangeView(v.key)}
              className={cn(
                "relative flex items-center px-4 text-[12px] transition-colors",
                v.disabled
                  ? "cursor-not-allowed text-subtle/60"
                  : active
                  ? "text-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              {v.label}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-[2px] bg-fg" />
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Inspect open control. Sits on the right edge in its own bordered
          slot so the drawer's INSPECT header lands flush against it. */}
      <button
        type="button"
        onClick={onOpenInspect}
        className="group flex items-stretch bg-info-solid text-fg transition-colors hover:bg-info-solid/85"
      >
        <div className="flex items-center gap-1.5 px-4 text-[12px] font-medium">
          <ChevronLeft
            className="h-3 w-3 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.85}
          />
          <span className="lowercase tracking-tight">inspect</span>
        </div>
      </button>
    </div>
  );
}
