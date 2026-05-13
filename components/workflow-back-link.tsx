"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

function BackLinkInner() {
  const sp = useSearchParams();
  const from = sp.get("from");
  const toWorkflows = from === "workflows";
  const href = toWorkflows ? "/workflows" : "/";
  const label = toWorkflows ? "All workflows" : "Home";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-fg"
    >
      <ArrowLeft className="h-3 w-3" strokeWidth={1.85} />
      {label}
    </Link>
  );
}

// Wrap with Suspense so useSearchParams doesn't escape its boundary
// when rendered inside a server-component layout.
export function WorkflowBackLink() {
  return (
    <Suspense
      fallback={
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.85} />
          Home
        </Link>
      }
    >
      <BackLinkInner />
    </Suspense>
  );
}
