"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FAQ } from "@/data/help";
import { cn } from "@/lib/utils";

export function HelpFAQ({ faqs }: { faqs: FAQ[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <ul className="overflow-hidden rounded-[6px] border border-border bg-panel">
      {faqs.map((f, i) => {
        const open = openIdx === i;
        return (
          <li key={i} className="border-b border-border last:border-b-0">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-panel-2/40"
            >
              <span className="text-[12px] font-medium text-fg">
                {f.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-subtle transition-transform",
                  open && "rotate-180",
                )}
                strokeWidth={1.85}
              />
            </button>
            {open && (
              <div className="border-t border-border px-4 py-3">
                <p className="max-w-[760px] text-[12px] leading-[1.6] text-muted">
                  {f.answer}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
