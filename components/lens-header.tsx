"use client";

import { usePathname } from "next/navigation";

const LENSES = {
  flow: {
    label: "Flow",
    tagline: "How the workflow is wired together",
  },
  health: {
    label: "Health",
    tagline: "How the workflow is performing right now",
  },
  actions: {
    label: "Actions",
    tagline: "What to do about the deviations",
  },
  intent: {
    label: "Intent",
    tagline: "The contract this workflow keeps with the business",
  },
} as const;

type LensKey = keyof typeof LENSES;

export function LensHeader({ id }: { id: string }) {
  const pathname = usePathname();
  const base = `/workflows/${id}`;

  let key: LensKey = "flow";
  if (pathname === `${base}/intent`) key = "intent";
  else if (pathname === `${base}/health`) key = "health";
  else if (pathname === `${base}/actions`) key = "actions";

  const { label, tagline } = LENSES[key];

  return (
    <div className="bg-panel-2/40 px-8 py-2.5">
      <div className="flex items-baseline gap-2.5">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-fg">
          {label}
        </span>
        <span className="text-border-strong">·</span>
        <span className="text-[11.5px] leading-[1.5] text-muted">
          {tagline}
        </span>
      </div>
    </div>
  );
}
