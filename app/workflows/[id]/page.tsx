import { notFound } from "next/navigation";
import { getWorkflow } from "@/data/workflows";
import { FlowView } from "@/components/flow-view";

export default async function FlowTabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);
  if (!workflow) notFound();
  return <FlowView workflow={workflow} />;
}
