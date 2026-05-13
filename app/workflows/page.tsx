"use client";

import { useMemo } from "react";
import { DEMO_LOADED_WORKFLOWS, WORKFLOWS } from "@/data/workflows";
import { getHealth } from "@/data/health";
import { getRuns } from "@/data/runs";
import { NOW } from "@/lib/time";
import { useDemoLoaded } from "@/lib/demo";
import { WorkflowDirectory } from "@/components/workflow-directory";

export default function WorkflowsIndexPage() {
  const demoLoaded = useDemoLoaded();

  // When the demo workflow is loaded, enrich it. Otherwise the directory
  // is empty (and renders its own empty hero).
  const enriched = useMemo(() => {
    const source = demoLoaded ? DEMO_LOADED_WORKFLOWS : WORKFLOWS;
    const cutoffMs = NOW.getTime() - 24 * 60 * 60 * 1000;
    return source.map((w) => {
      const health = getHealth(w.id);
      const runs = getRuns(w.id);
      const recentFailures = runs.filter((r) => {
        if (r.status === "success") return false;
        return new Date(r.startedAt).getTime() >= cutoffMs;
      }).length;
      return {
        id: w.id,
        name: w.name,
        platform: w.platform,
        status: w.status,
        statusLine: w.statusLine,
        lastRunAt: w.lastRunAt,
        owner: w.owner,
        healthScore: health?.score,
        recentFailures,
      };
    });
  }, [demoLoaded]);

  return <WorkflowDirectory workflows={enriched} />;
}
