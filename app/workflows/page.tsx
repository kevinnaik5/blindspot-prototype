import { WORKFLOWS } from "@/data/workflows";
import { getHealth } from "@/data/health";
import { getRuns } from "@/data/runs";
import { NOW } from "@/lib/time";
import { WorkflowDirectory } from "@/components/workflow-directory";

export default function WorkflowsIndexPage() {
  // Enrich each workflow with at-a-glance signals the directory cares
  // about: health score, recent failure count (silent + outright failed
  // in the last 24h). The page is a server component so this work is
  // free, no client-side fetching.
  const cutoffMs = NOW.getTime() - 24 * 60 * 60 * 1000;

  const enriched = WORKFLOWS.map((w) => {
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

  return <WorkflowDirectory workflows={enriched} />;
}
