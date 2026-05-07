"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function FocusableActionItem({
  actionId,
  className,
  children,
}: {
  actionId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const params = useSearchParams();
  const focused = params.get("focus") === actionId;
  const ref = useRef<HTMLDivElement>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!focused) return;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 2000);
    return () => clearTimeout(t);
  }, [focused]);

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[8px] transition-shadow duration-300",
        pulse &&
          "ring-2 ring-info/70 ring-offset-2 ring-offset-bg shadow-[0_0_0_4px_hsl(var(--info)/0.12)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
