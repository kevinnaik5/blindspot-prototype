"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bell,
  Plug,
  Play,
  Upload,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Eyebrow } from "@/components/section-label";

type QuickStartCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

// Onboarding cards live with the client component so that LucideIcon
// functions don't have to cross the server → client component boundary.
const CARDS: QuickStartCard[] = [
  {
    title: "Connect a platform",
    description: "Sync workflows from Zapier, n8n, Make, and more.",
    href: "/connections",
    icon: Plug,
  },
  {
    title: "Import a workflow",
    description: "Add a workflow manually with YAML or JSON.",
    href: "/connections",
    icon: Upload,
  },
  {
    title: "Walk through a demo",
    description: "See how Blindspot reads an automation.",
    href: "/workflows/customer-onboarding",
    icon: Play,
  },
  {
    title: "Invite your team",
    description: "Add ops staff to this workspace.",
    href: "/settings",
    icon: Users,
  },
  {
    title: "Set up alert routing",
    description: "Send critical alerts to Slack or PagerDuty.",
    href: "/settings",
    icon: Bell,
  },
];

export function QuickStart() {
  // In-memory dismissal only, refresh brings the panel back. Best for
  // running the demo repeatedly without devtools clears.
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <section className="relative mt-8">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Skip setup guide"
        title="Skip setup guide"
        className="absolute right-0 top-0 inline-flex items-center gap-1 text-[12px] text-subtle transition-colors hover:text-fg"
      >
        Skip setup
        <X className="h-3 w-3" strokeWidth={1.85} />
      </button>

      <Eyebrow>Let&apos;s get started</Eyebrow>
      <h1 className="mt-3 text-[32px] font-medium leading-[1.1] tracking-tightish text-fg">
        Welcome to Blindspot
      </h1>

      <div className="-mx-8 mt-7 flex gap-3 overflow-x-auto px-8 pb-3 [scrollbar-width:thin]">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex h-[164px] w-[260px] shrink-0 flex-col rounded-[6px] border border-border bg-panel p-4 transition-colors hover:border-border-strong hover:bg-panel-2"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-panel-2 text-muted transition-colors group-hover:border-border-strong group-hover:text-fg">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>

              <div className="mt-3.5">
                <div className="text-[14px] font-medium tracking-tightish text-fg">
                  {card.title}
                </div>
                <div className="mt-1 text-[12.5px] leading-[1.5] text-muted">
                  {card.description}
                </div>
              </div>

              <div className="mt-auto flex justify-end">
                <ArrowUpRight
                  className="h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                  strokeWidth={1.75}
                />
              </div>
            </Link>
          );
        })}
        <div className="w-2 shrink-0" />
      </div>
    </section>
  );
}
