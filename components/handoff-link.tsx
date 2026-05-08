import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HandoffTone = "critical" | "warning" | "info";
export type HandoffSize = "sm" | "md";

const TONE_CLASS: Record<HandoffTone, string> = {
  critical:
    "border-critical/55 bg-critical/15 hover:border-critical/70 hover:bg-critical/25",
  warning:
    "border-warning/55 bg-warning/15 hover:border-warning/70 hover:bg-warning/25",
  info: "border-info/55 bg-info/15 hover:border-info/70 hover:bg-info/25",
};

const SIZE_CLASS: Record<HandoffSize, string> = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-3 py-1.5 text-[12.5px] gap-1.5",
};

const ICON_SIZE: Record<HandoffSize, string> = {
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
};

export function HandoffLink({
  workflowId,
  actionId,
  label = "View suggested action",
  tone = "info",
  size = "sm",
  className,
}: {
  workflowId: string;
  actionId: string;
  label?: string;
  tone?: HandoffTone;
  size?: HandoffSize;
  className?: string;
}) {
  return (
    <Link
      href={`/workflows/${workflowId}/actions?focus=${actionId}`}
      className={cn(
        "inline-flex items-center rounded-md border font-medium text-fg transition-colors",
        TONE_CLASS[tone],
        SIZE_CLASS[size],
        className,
      )}
    >
      {label}
      <ArrowRight className={ICON_SIZE[size]} strokeWidth={2} />
    </Link>
  );
}
