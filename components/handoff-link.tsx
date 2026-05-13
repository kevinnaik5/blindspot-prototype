import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type HandoffTone = "critical" | "warning" | "info";

const TONE_CLASS: Record<HandoffTone, string> = {
  critical: "bg-critical-solid text-fg hover:bg-critical-solid/85",
  warning: "bg-warning-solid text-fg hover:bg-warning-solid/85",
  info: "bg-info-solid text-fg hover:bg-info-solid/85",
};

export function HandoffLink({
  workflowId,
  actionId,
  label = "View suggested action",
  tone = "info",
  className,
}: {
  workflowId: string;
  actionId: string;
  label?: string;
  tone?: HandoffTone;
  className?: string;
}) {
  return (
    <Link
      href={`/workflows/${workflowId}/actions?focus=${actionId}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors",
        TONE_CLASS[tone],
        className,
      )}
    >
      {label}
      <ArrowRight className="h-3 w-3" strokeWidth={2} />
    </Link>
  );
}
