import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Prominent section heading. White, semi-bold, optionally led by a small icon.
export function SectionHeading({
  children,
  className,
  trailing,
  icon: Icon,
}: {
  children: React.ReactNode;
  className?: string;
  trailing?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between",
        // When there's a trailing element (like "View all" or a count),
        // anchor it to the heading with a separator line so the two
        // sides don't float apart across the empty middle.
        trailing && "border-b border-border pb-2.5",
        className,
      )}
    >
      <h2 className="flex items-center gap-2 text-[14px] font-medium tracking-tightish text-fg">
        {Icon && (
          <Icon
            className="h-3.5 w-3.5 shrink-0 text-muted"
            strokeWidth={1.75}
          />
        )}
        <span>{children}</span>
      </h2>
      {trailing && (
        <div className="text-[11.5px] text-subtle">{trailing}</div>
      )}
    </div>
  );
}

// Tiny uppercase eyebrow used above heroes ("LET'S GET STARTED") and as column headers.
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-[10.5px] font-medium uppercase tracking-[0.1em] text-subtle",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const SectionLabel = SectionHeading;
