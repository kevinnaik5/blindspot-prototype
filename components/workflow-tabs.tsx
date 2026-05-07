"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "intent", label: "Intent" },
  { key: "flow", label: "Flow" },
  { key: "health", label: "Health" },
  { key: "actions", label: "Actions" },
] as const;

export function WorkflowTabs({
  id,
  actionCount = 0,
  hasUrgentAction = false,
}: {
  id: string;
  actionCount?: number;
  hasUrgentAction?: boolean;
}) {
  const pathname = usePathname();
  const base = `/workflows/${id}`;

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-1 px-8">
        {TABS.map((tab) => {
          // "flow" is the default tab and lives at the workflow root path
          const href = tab.key === "flow" ? base : `${base}/${tab.key}`;
          const active =
            tab.key === "flow"
              ? pathname === base
              : pathname === `${base}/${tab.key}`;
          const showBadge = tab.key === "actions" && actionCount > 0;
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                "relative inline-flex items-center gap-2 px-3 py-3 text-[13px] font-medium transition-colors",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              {tab.label}
              {showBadge && (
                <span
                  className={cn(
                    "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10.5px] font-semibold tabular-nums",
                    hasUrgentAction
                      ? "bg-critical/15 text-critical"
                      : "bg-panel-2 text-muted",
                  )}
                >
                  {actionCount}
                </span>
              )}
              {active && (
                <span className="absolute inset-x-3 bottom-0 h-[2px] bg-fg" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
