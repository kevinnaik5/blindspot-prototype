"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GitBranch,
  Plug,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/workflows",
    label: "Workflows",
    icon: GitBranch,
    match: (p: string) => p.startsWith("/workflows"),
  },
  {
    href: "/connections",
    label: "Connections",
    icon: Plug,
    match: (p: string) => p.startsWith("/connections"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (p: string) => p.startsWith("/settings"),
  },
];

function BlindspotMark({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="currentColor"
        strokeOpacity="0.55"
      />
      <circle cx="10.6" cy="6.4" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-panel transition-[width] duration-200 ease-out",
        collapsed ? "w-[56px]" : "w-[220px]",
      )}
    >
      {/* Brand row */}
      <div
        className={cn(
          "flex items-center pt-4 pb-6",
          collapsed ? "flex-col gap-3 px-0" : "justify-between px-4",
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed && "px-0")}>
          <BlindspotMark className="text-fg" />
          {!collapsed && (
            <span className="text-[14px] font-medium tracking-tightish text-fg">
              Blindspot
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-7 w-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-panel-2 hover:text-fg"
        >
          {collapsed ? (
            <PanelLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-4 pb-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
          Workspace
        </div>
      )}

      <nav className={cn("flex flex-col gap-px", collapsed ? "px-2" : "px-2")}>
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-md text-[13.5px] transition-colors",
                collapsed
                  ? "h-8 justify-center"
                  : "gap-2.5 px-3 py-1.5",
                active
                  ? "bg-panel-2 text-fg"
                  : "text-muted hover:bg-panel-2/60 hover:text-fg",
              )}
            >
              <Icon
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-colors",
                  active ? "text-fg" : "text-subtle group-hover:text-muted",
                )}
                strokeWidth={1.75}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="mt-8 px-4">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-subtle">
            Workspace
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[13px] text-fg">Acme Operations</span>
            <span className="text-[11px] text-subtle">free</span>
          </div>
        </div>
      )}

      <div className="mt-auto" />

      {/* User */}
      <div
        className={cn(
          "border-t border-border",
          collapsed ? "flex justify-center py-3" : "px-4 py-3",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "" : "gap-2.5",
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-panel-2 text-[11px] font-medium text-fg ring-1 ring-border-strong">
            KN
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12.5px] text-fg">Kevin Naik</div>
              <div className="truncate text-[11px] text-subtle">
                kevin@acme.co
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
