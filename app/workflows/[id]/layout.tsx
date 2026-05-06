import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getWorkflow, PLATFORM_LABEL } from "@/data/workflows";
import { relativeFromNow } from "@/lib/time";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { cn } from "@/lib/utils";

export default async function WorkflowLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();

  const failing = workflow.status !== "healthy";

  return (
    <div className="flex h-full flex-col">
      {/* Top chrome */}
      <div className="shrink-0 border-b border-border">
        <div className="px-8 pt-7 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.85} />
            All workflows
          </Link>

          <h1 className="mt-4 text-[22px] font-medium leading-tight tracking-tightish text-fg">
            {workflow.name}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-muted">
            <span>
              Owned by <span className="text-fg">{workflow.owner.name}</span>
            </span>
            <Dot />
            <span>{PLATFORM_LABEL[workflow.platform]}</span>
            <Dot />
            <span>Last run {relativeFromNow(workflow.lastRunAt)}</span>
            <Dot />
            <span
              className={cn(
                "inline-flex items-center gap-1.5",
                failing ? "text-critical" : "text-ok",
              )}
            >
              {failing ? (
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.85} />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.85} />
              )}
              {workflow.statusLine}
            </span>
          </div>
        </div>

        <WorkflowTabs id={id} />
      </div>

      {/* Tab content fills the remaining viewport */}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Dot() {
  return <span className="text-border-strong">·</span>;
}
