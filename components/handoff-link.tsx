import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HandoffLink({
  workflowId,
  actionId,
  label = "View suggested action",
  className,
}: {
  workflowId: string;
  actionId: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={`/workflows/${workflowId}/actions?focus=${actionId}`}
      className={cn(
        "inline-flex items-center gap-1.5 text-[11.5px] font-medium text-info transition-colors hover:text-fg",
        className,
      )}
    >
      {label}
      <ArrowRight className="h-3 w-3" strokeWidth={1.95} />
    </Link>
  );
}
