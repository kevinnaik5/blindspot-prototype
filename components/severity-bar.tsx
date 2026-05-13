import { AlertCircle, AlertTriangle, Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/data/alerts";

const COLOR: Record<Severity, string> = {
  critical: "bg-critical",
  warning: "bg-warning",
  notice: "bg-info",
};

export function SeverityBar({ severity }: { severity: Severity }) {
  return (
    <div
      aria-label={`Severity: ${severity}`}
      className={cn(
        "absolute left-0 top-0 h-full w-[3px]",
        COLOR[severity],
      )}
    />
  );
}

const LABEL: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  notice: "Notice",
};

export function SeverityLabel({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "text-[12px] font-medium uppercase tracking-[0.1em]",
        severity === "critical" && "text-critical",
        severity === "warning" && "text-warning",
        severity === "notice" && "text-info",
      )}
    >
      {LABEL[severity]}
    </span>
  );
}

const SEVERITY_ICON: Record<Severity, LucideIcon> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  notice: Info,
};

const SEVERITY_TEXT: Record<Severity, string> = {
  critical: "text-critical",
  warning: "text-warning",
  notice: "text-info",
};

export function SeverityIcon({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const Icon = SEVERITY_ICON[severity];
  return (
    <Icon
      className={cn("h-3.5 w-3.5 shrink-0", SEVERITY_TEXT[severity], className)}
      strokeWidth={1.85}
    />
  );
}
