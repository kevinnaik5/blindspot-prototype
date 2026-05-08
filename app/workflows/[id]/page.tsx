import { notFound } from "next/navigation";
import { getWorkflow } from "@/data/workflows";
import { FlowView } from "@/components/flow-view";

export default async function FlowTabPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; status?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();
  return (
    <FlowView
      workflow={workflow}
      initialView={sp.view}
      initialRunStatus={sp.status}
    />
  );
}
